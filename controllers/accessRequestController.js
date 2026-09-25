const { Op } = require("sequelize");
const {
  AccessRequest,
  Message,
  Product,
  SavedPattern,
  User,
  AccessRequestStatusHistory,
} = require("../models");


const userCanAccess = (request, userId) =>
  Number(request.requester_id) === Number(userId) ||
  Number(request.owner_id) === Number(userId);

exports.create = async (req, res, next) => {
  try {
    const { t } = res.locals;
    const product = await Product.findByPk(req.params.id);
    if (!product || !product.pdf_path) {
      req.flash("error", t.access_file_unavailable);
      return res.redirect("/all_products");
    }
    if (Number(product.user_id) === Number(req.session.userId)) {
      req.flash("error", t.access_own_product);
      return res.redirect("/all_products");
    }

    const [request, created] = await AccessRequest.findOrCreate({
      where: { product_id: product.id, requester_id: req.session.userId },
      defaults: { owner_id: product.user_id, status: "pending" },
    });

    if (created) {
      await AccessRequestStatusHistory.create({
        access_request_id: request.id,
        old_status: null,
        new_status: "pending",
        changed_by: req.session.userId,
      });
      await Message.create({
        access_request_id: request.id,
        sender_id: req.session.userId,
        body: t.access_default_message,
      });
      req.flash("success", t.access_request_sent);
    } else if (request.status === "rejected") {
      await request.update({ status: "pending", approved_at: null });
      await AccessRequestStatusHistory.create({
        access_request_id: request.id,
        old_status: "rejected",
        new_status: "pending",
        changed_by: req.session.userId,
      });
      await Message.create({
        access_request_id: request.id,
        sender_id: req.session.userId,
        body: t.access_resent_message,
      });
      req.flash("success", t.access_request_resent);
    } else if (request.status === "pending") {
      req.flash("error", t.access_already_pending);
    } else {
      req.flash("success", t.access_already_granted);
    }
    return res.redirect(`/access-requests/${request.id}`);
  } catch (error) {
    next(error);
  }
};

const requestIncludes = [
  {
    model: Product,
    attributes: ["id", "product_name"],
  },
  {
    model: User,
    as: "requester",
    attributes: ["id", "firstName", "lastName", "email"],
  },
  {
    model: User,
    as: "owner",
    attributes: ["id", "firstName", "lastName", "email"],
  },
];

/* Requests received for products owned by the logged-in user */
exports.listReceived = async (req, res, next) => {
  try {
    const { t } = res.locals;
    const requests = await AccessRequest.findAll({
      where: {
        owner_id: req.session.userId,
      },
      include: requestIncludes,
      order: [["updatedAt", "DESC"]],
    });

    return res.render("pages/access_requests", {
      requests,
      currentUserId: req.session.userId,
      pageMode: "received",
      pageTitle: t.access_received_title,
      pageSubtitle: t.access_received_subtitle,
      success_message: res.locals.successMessage,
      error_message: res.locals.errorMessage,
    });
  } catch (error) {
    next(error);
  }
};

/* Requests sent by the logged-in user to other product owners */
exports.listSent = async (req, res, next) => {
  try {
    const { t } = res.locals;
    const requests = await AccessRequest.findAll({
      where: {
        requester_id: req.session.userId,
      },
      include: requestIncludes,
      order: [["updatedAt", "DESC"]],
    });

    return res.render("pages/access_requests", {
      requests,
      currentUserId: req.session.userId,
      pageMode: "sent",
      pageTitle: t.access_sent_title,
      pageSubtitle: t.access_sent_subtitle,
      success_message: res.locals.successMessage,
      error_message: res.locals.errorMessage,
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const request = await AccessRequest.findByPk(req.params.id, {
      include: [
        { model: Product, attributes: ["id", "product_name", "pdf_path"] },
        { model: User, as: "requester", attributes: ["id", "firstName", "lastName"] },
        { model: Message, include: [{ model: User, as: "sender", attributes: ["id", "firstName", "lastName"] }] },
        {
          model: AccessRequestStatusHistory,
          as: "statusHistory",
          include: [{ model: User, as: "changedBy", attributes: ["id", "firstName", "lastName"] }],
        },
      ],
      order: [
        [Message, "createdAt", "ASC"],
        [{ model: AccessRequestStatusHistory, as: "statusHistory" }, "changed_at", "ASC"],
      ],
    });
    if (!request || !userCanAccess(request, req.session.userId)) return res.status(403).render("403");
    res.render("pages/access_request_detail", {
      request,
      isOwner: Number(request.owner_id) === Number(req.session.userId),
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { t } = res.locals;
    const request = await AccessRequest.findByPk(req.params.id);
    if (!request || !userCanAccess(request, req.session.userId)) return res.status(403).render("403");
    const body = (req.body.body || "").trim();
    if (!body) {
      req.flash("error", t.access_message_required);
      return res.redirect(`/access-requests/${request.id}`);
    }
    await Message.create({ access_request_id: request.id, sender_id: req.session.userId, body });
    await request.update({ updatedAt: new Date() });
    return res.redirect(`/access-requests/${request.id}`);
  } catch (error) {
    next(error);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { t } = res.locals;
    const request = await AccessRequest.findByPk(req.params.id);

    if (!request || Number(request.owner_id) !== Number(req.session.userId)) {
      return res.status(403).render("403");
    }

    const status = req.params.status;
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).render("404");
    }

    const oldStatus = request.status;

    if (oldStatus === status) {
      req.flash("error", t.access_status_same);
      return res.redirect(`/access-requests/${request.id}`);
    }

    await request.update({
      status,
      approved_at: status === "approved" ? new Date() : null,
    });

    await AccessRequestStatusHistory.create({
      access_request_id: request.id,
      old_status: oldStatus,
      new_status: status,
      changed_by: req.session.userId,
      changed_at: new Date(),
    });

    req.flash("success", t.access_status_updated);
    return res.redirect(`/access-requests/${request.id}`);
  } catch (error) {
    next(error);
  }
};

exports.getProductAccessRequests = async (req, res, next) => {
  try {
    const accessRequests = await AccessRequest.findAll({
      where: {
        requester_id: req.session.userId,
        status: "approved",
      },
      include: [
        {
          model: Product,
          attributes: [
            "id",
            "product_name",
            "product_description",
            "pdf_path",
            "is_pattern_published",
          ],
          include: [{
            model: SavedPattern,
            as: "pattern",
            attributes: ["id", "name", "cover_image"],
            required: false,
          }],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["approved_at", "DESC"]],
    });

    return res.render("pages/product_access_requests", {
      accessRequests,
      success_message: res.locals.successMessage,
      error_message: res.locals.errorMessage,
    });
  } catch (error) {
    console.error("getProductAccessRequests error:", error);
    return next(error);
  }
};
