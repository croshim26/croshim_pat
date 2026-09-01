const { Op } = require("sequelize");
const { AccessRequest, Message, Product, User } = require("../models");

const userCanAccess = (request, userId) =>
  request.requester_id === userId || request.owner_id === userId;

exports.create = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product || !product.pdf_path) {
      req.flash("error", "الملف غير متاح.");
      return res.redirect("/all_products");
    }
    if (product.user_id === req.session.userId) {
      req.flash("error", "لا يمكنك طلب الوصول إلى ملفك الخاص.");
      return res.redirect("/all_products");
    }

    const [request, created] = await AccessRequest.findOrCreate({
      where: { product_id: product.id, requester_id: req.session.userId },
      defaults: { owner_id: product.user_id, status: "pending" },
    });

    if (created) {
      await Message.create({
        access_request_id: request.id,
        sender_id: req.session.userId,
        body: "مرحباً، أرغب في طلب الوصول إلى ملف هذا المنتج.",
      });
      req.flash("success", "تم إرسال طلب الوصول.");
    }
    return res.redirect(`/access-requests/${request.id}`);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const requests = await AccessRequest.findAll({
      where: { [Op.or]: [{ requester_id: req.session.userId }, { owner_id: req.session.userId }] },
      include: [
        { model: Product, attributes: ["id", "product_name"] },
        { model: User, as: "requester", attributes: ["id", "firstName", "lastName"] },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.render("pages/access_requests", { requests });
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
      ],
      order: [[Message, "createdAt", "ASC"]],
    });
    if (!request || !userCanAccess(request, req.session.userId)) return res.status(403).render("403");
    res.render("pages/access_request_detail", { request, isOwner: request.owner_id === req.session.userId });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const request = await AccessRequest.findByPk(req.params.id);
    if (!request || !userCanAccess(request, req.session.userId)) return res.status(403).render("403");
    const body = (req.body.body || "").trim();
    if (!body) {
      req.flash("error", "اكتب رسالة أولاً.");
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
    const request = await AccessRequest.findByPk(req.params.id);
    if (!request || request.owner_id !== req.session.userId) return res.status(403).render("403");
    const status = req.params.status;
    if (!["approved", "rejected"].includes(status)) return res.status(400).render("404");
    await request.update({ status, approved_at: status === "approved" ? new Date() : null });
    return res.redirect(`/access-requests/${request.id}`);
  } catch (error) {
    next(error);
  }
};
