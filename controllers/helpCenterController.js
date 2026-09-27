const HELP_ARTICLES = {
  en: [
    {
      slug: "getting-started",
      icon: "fa-seedling",
      title: "Getting started with Croshim Studio",
      summary: "Create an account, explore the platform, and choose where to begin.",
      sections: [
        { heading: "What Croshim Studio does", body: "Croshim Studio helps crochet makers organise products, create pattern workbooks, publish files, and manage access requests in one place." },
        { heading: "Your first steps", steps: ["Create an account or sign in.", "Open your Dashboard to manage products you have added.", "Use Pattern Builder when you want to write a structured crochet pattern.", "Browse Products to discover items shared by other makers."] },
      ],
    },
    {
      slug: "account",
      icon: "fa-user-plus",
      title: "Create an account and sign in",
      summary: "Learn how registration, sign-in, and the welcome email work.",
      sections: [
        { heading: "Creating your account", steps: ["Choose Create account from the sign-in area.", "Enter your name, email address, phone number, and a password of at least 8 characters.", "Optional details, such as country and crochet experience, help personalise your account.", "After registration, Croshim Studio sends a welcome email in the language selected on the site."] },
        { heading: "Signing in", body: "Use the email address and password you registered with. If you cannot sign in, use Forgot password to receive a secure password-reset link." },
      ],
    },
    {
      slug: "products",
      icon: "fa-box-open",
      title: "Add and manage products",
      summary: "Create a product, add its details, upload a file, and control visibility.",
      sections: [
        { heading: "Add a product", steps: ["From the dashboard or Products menu, choose Add product.", "Enter a clear product name and a useful description.", "Attach a PDF if you want to provide instructions or a pattern file.", "Save the product; you can return later to update its visibility."] },
        { heading: "Visibility", body: "A published product can appear in Browse Products. You can hide it from the dashboard at any time. Product visibility and pattern-file visibility are managed separately, so check both settings before sharing." },
      ],
    },
    {
      slug: "pattern-builder",
      icon: "fa-book-open",
      title: "Use Pattern Builder",
      summary: "Build a clear crochet workbook with materials, abbreviations, parts, and photos.",
      sections: [
        { heading: "Build your pattern", steps: ["Open Patterns, then Pattern Builder.", "Add a pattern name, short description, emoji, theme, and cover image if needed.", "List the tools and materials.", "Add abbreviations, then create each pattern part with its rows and notes.", "Select Generate Pattern to preview the workbook."] },
        { heading: "Save and reuse", body: "Choose Save to keep your workbook in the saved-pattern list. Open a saved pattern again from the strip at the top of Pattern Builder. You can also save a finished workbook as a product from the builder." },
      ],
    },
    {
      slug: "access-requests",
      icon: "fa-unlock-alt",
      title: "Request access to a private file",
      summary: "Ask a product owner for a private PDF and follow the request status.",
      sections: [
        { heading: "Send a request", steps: ["Sign in first.", "Open the relevant product in Browse Products.", "Select Request file access when the file is private.", "Write a respectful message if the request page asks for one.", "The product owner can approve, reject, or return the request to pending."] },
        { heading: "Follow your request", body: "Open Access Requests, then My Sent Requests. You can see the request status, exchange messages with the owner, and open the file once your request is approved." },
      ],
    },
    {
      slug: "manage-requests",
      icon: "fa-inbox",
      title: "Manage requests for your products",
      summary: "Review requests received from other users and decide who can access a file.",
      sections: [
        { heading: "Review received requests", steps: ["Open Access Requests, then Received Requests.", "Open a request to read its message and view its status history.", "Choose Approve to grant file access, or Reject if you do not want to grant it.", "You may return a request to Pending if you need more information before deciding."] },
        { heading: "Keep conversations clear", body: "Use the message area to explain your decision or ask a question. Only the product owner can change an access-request status." },
      ],
    },
    {
      slug: "profile-security",
      icon: "fa-shield-alt",
      title: "Profile, password, and account security",
      summary: "Update your details and recover your account safely.",
      sections: [
        { heading: "Update your profile", body: "Open the profile menu from the navigation bar to update your account information. Keep your email address current so you can receive account emails and password-reset links." },
        { heading: "Reset a password", steps: ["Choose Forgot password on the sign-in screen.", "Enter the email address attached to your account.", "Use the reset link from the email and choose a new strong password.", "Never share your password or reset link with another person."] },
      ],
    },
  ],
  ar: [
    {
      slug: "getting-started",
      icon: "fa-seedling",
      title: "البدء مع كروشيم ستوديو",
      summary: "أنشئي حسابك، استكشفي المنصة، واختاري نقطة البداية المناسبة لك.",
      sections: [
        { heading: "ماذا تقدم كروشيم ستوديو؟", body: "تساعدك كروشيم ستوديو على تنظيم المنتجات، إنشاء دفاتر الباترونات، نشر الملفات، وإدارة طلبات الوصول في مكان واحد." },
        { heading: "خطواتك الأولى", steps: ["أنشئي حساباً جديداً أو سجّلي الدخول.", "افتحي لوحة التحكم لإدارة المنتجات التي أضفتِها.", "استخدمي باني الباترون عندما تريدين كتابة باترون كروشيه منظم.", "تصفحي المنتجات لاكتشاف ما شاركته صانعات الكروشيه الأخريات."] },
      ],
    },
    {
      slug: "account",
      icon: "fa-user-plus",
      title: "إنشاء حساب وتسجيل الدخول",
      summary: "تعرّفي على التسجيل وتسجيل الدخول ورسالة الترحيب.",
      sections: [
        { heading: "إنشاء الحساب", steps: ["اختاري إنشاء حساب من منطقة تسجيل الدخول.", "أدخلي الاسم والبريد الإلكتروني ورقم الجوال وكلمة مرور لا تقل عن 8 أحرف.", "التفاصيل الاختيارية مثل الدولة ومستوى خبرتك في الكروشيه تساعد على تخصيص حسابك.", "بعد التسجيل سترسل كروشيم ستوديو رسالة ترحيب باللغة المختارة في الموقع."] },
        { heading: "تسجيل الدخول", body: "استخدمي البريد الإلكتروني وكلمة المرور المسجلين في حسابك. إذا لم تتمكني من الدخول، اختاري نسيت كلمة المرور لتصلك رسالة آمنة لإعادة تعيينها." },
      ],
    },
    {
      slug: "products",
      icon: "fa-box-open",
      title: "إضافة المنتجات وإدارتها",
      summary: "أنشئي منتجاً، أضيفي تفاصيله وملفه، وتحكمي في ظهوره.",
      sections: [
        { heading: "إضافة منتج", steps: ["من لوحة التحكم أو قائمة المنتجات اختاري إضافة منتج.", "اكتبي اسماً واضحاً للمنتج ووصفاً مفيداً له.", "أرفقي ملف PDF إذا أردتِ تقديم تعليمات أو ملف باترون.", "احفظي المنتج، ويمكنك العودة لاحقاً لتعديل إعدادات ظهوره."] },
        { heading: "الظهور والنشر", body: "المنتج المنشور قد يظهر في صفحة تصفح المنتجات. يمكنك إخفاؤه من لوحة التحكم في أي وقت. ظهور المنتج وظهور ملف الباترون إعدادان منفصلان، لذلك تحققي من كليهما قبل المشاركة." },
      ],
    },
    {
      slug: "pattern-builder",
      icon: "fa-book-open",
      title: "استخدام باني الباترون",
      summary: "أنشئي دفتر باترون واضحاً يحتوي على الأدوات والاختصارات والأجزاء والصور.",
      sections: [
        { heading: "إنشاء الباترون", steps: ["افتحي الباترونات ثم باني الباترون.", "أضيفي اسم الباترون ووصفاً قصيراً ورمزاً تعبيرياً وثيماً وصورة غلاف عند الحاجة.", "أدرجي الأدوات والخامات.", "أضيفي الاختصارات، ثم أنشئي كل جزء من الباترون مع الأسطر والملاحظات.", "اختاري إنشاء الباترون لمعاينة دفتر العمل."] },
        { heading: "الحفظ وإعادة الاستخدام", body: "اختاري حفظ للاحتفاظ بدفتر الباترون في قائمة الباترونات المحفوظة. يمكنك فتح أي باترون محفوظ من الشريط أعلى باني الباترون، كما يمكنك حفظ دفتر مكتمل كمنتج من الباني." },
      ],
    },
    {
      slug: "access-requests",
      icon: "fa-unlock-alt",
      title: "طلب الوصول إلى ملف خاص",
      summary: "اطلبي من صاحبة المنتج الوصول إلى ملف PDF خاص وتابعي حالة طلبك.",
      sections: [
        { heading: "إرسال الطلب", steps: ["سجّلي الدخول أولاً.", "افتحي المنتج المطلوب من صفحة تصفح المنتجات.", "اختاري طلب الوصول للملف عندما يكون الملف خاصاً.", "اكتبي رسالة واضحة ومحترمة إذا ظهرت لك صفحة الطلب.", "يمكن لصاحبة المنتج قبول الطلب أو رفضه أو إعادته إلى قيد المراجعة."] },
        { heading: "متابعة الطلب", body: "افتحي طلبات الوصول ثم طلباتي المرسلة. يمكنك مشاهدة الحالة وتبادل الرسائل مع صاحبة المنتج وفتح الملف عندما تتم الموافقة." },
      ],
    },
    {
      slug: "manage-requests",
      icon: "fa-inbox",
      title: "إدارة طلبات منتجاتك",
      summary: "راجعي طلبات المستخدمين الآخرين وقرري من يمكنه الوصول إلى الملف.",
      sections: [
        { heading: "مراجعة الطلبات المستلمة", steps: ["افتحي طلبات الوصول ثم الطلبات المستلمة.", "افتحي الطلب لقراءة الرسالة ومشاهدة سجل الحالة.", "اختاري موافقة لمنح الوصول إلى الملف، أو رفض إذا لم ترغبي في منحه.", "يمكنك إعادة الطلب إلى قيد المراجعة إذا احتجتِ معلومات إضافية قبل اتخاذ القرار."] },
        { heading: "حافظي على وضوح التواصل", body: "استخدمي منطقة الرسائل لشرح قرارك أو لطرح سؤال. صاحبة المنتج فقط هي من تستطيع تغيير حالة طلب الوصول." },
      ],
    },
    {
      slug: "profile-security",
      icon: "fa-shield-alt",
      title: "الملف الشخصي وكلمة المرور وأمان الحساب",
      summary: "حدّثي بياناتك واستعيدي حسابك بطريقة آمنة.",
      sections: [
        { heading: "تحديث الملف الشخصي", body: "افتحي قائمة الملف الشخصي من شريط التنقل لتحديث بيانات حسابك. احرصي على بقاء بريدك الإلكتروني محدثاً لتصلك رسائل الحساب وروابط إعادة تعيين كلمة المرور." },
        { heading: "إعادة تعيين كلمة المرور", steps: ["اختاري نسيت كلمة المرور من شاشة تسجيل الدخول.", "أدخلي البريد الإلكتروني المرتبط بحسابك.", "استخدمي الرابط الموجود في الرسالة واختاري كلمة مرور قوية جديدة.", "لا تشاركي كلمة المرور أو رابط إعادة التعيين مع أي شخص."] },
      ],
    },
  ],
};

/* Each numbered instruction has a direct destination inside the platform.
   Keeping routes separate from bilingual copy lets both languages use the
   same workflow links. */
const HELP_STEP_LINKS = {
  "getting-started": ["/register", "/dashboard", "/pattern-builder", "/all_products"],
  account: ["/register", "/register", "/register", "/"],
  products: ["/dashboard", "/dashboard", "/dashboard", "/dashboard"],
  "pattern-builder": ["/pattern-builder", "/pattern-builder", "/pattern-builder", "/pattern-builder", "/pattern-builder"],
  "access-requests": ["/", "/all_products", "/all_products", "/access-requests/sent", "/access-requests/sent"],
  "manage-requests": ["/access-requests/received", "/access-requests/received", "/access-requests/received", "/access-requests/received"],
  "profile-security": ["/reset", "/reset", "/reset", "/reset"],
};

exports.getHelpCenter = (req, res) => {
  const isEnglish = res.locals.lang === "en";

  res.render("pages/help_center", {
    pageTitle: isEnglish ? "Help Center | Croshim Studio" : "مركز المساعدة | كروشيم ستوديو",
    seo: {
      title: isEnglish ? "Help Center | Croshim Studio" : "مركز المساعدة | كروشيم ستوديو",
      description: isEnglish
        ? "Clear guides for using Croshim Studio, from creating an account to building patterns and managing file access."
        : "دليل واضح لاستخدام كروشيم ستوديو، من إنشاء الحساب إلى بناء الباترونات وإدارة الوصول للملفات.",
    },
    articles: HELP_ARTICLES[isEnglish ? "en" : "ar"].map((article) => ({
      ...article,
      stepLinks: HELP_STEP_LINKS[article.slug] || [],
    })),
  });
};
