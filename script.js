const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");
const gmailBaseUrl = "https://mail.google.com/mail/?view=cm&fs=1";
const mobileQuery = window.matchMedia("(max-width: 720px), (pointer: coarse)");

function syncMobileMode(eventOrQuery) {
  const isMobile = eventOrQuery.matches;
  document.body.classList.toggle("is-mobile", isMobile);
}

syncMobileMode(mobileQuery);

if (typeof mobileQuery.addEventListener === "function") {
  mobileQuery.addEventListener("change", syncMobileMode);
} else if (typeof mobileQuery.addListener === "function") {
  mobileQuery.addListener(syncMobileMode);
}

const blockedDomains = [
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "trashmail.com",
  "yopmail.com",
  "fakeinbox.com",
  "sharklasers.com",
];

function looksLikeGibberish(value) {
  const cleaned = value.toLowerCase().replace(/[^a-z]/g, "");

  if (cleaned.length < 4) {
    return false;
  }

  if (/(.)\1{3,}/.test(cleaned)) {
    return true;
  }

  if (!/[aeiou]/.test(cleaned)) {
    return true;
  }

  if (/[bcdfghjklmnpqrstvwxyz]{6,}/.test(cleaned)) {
    return true;
  }

  return false;
}

function setFormMessage(message, isError = true) {
  if (!formNote) {
    return;
  }

  formNote.textContent = message;
  formNote.style.background = isError ? "rgba(255, 226, 226, 0.9)" : "rgba(218, 240, 230, 0.55)";
  formNote.style.color = isError ? "#8a2222" : "#0d5c4d";
}

function buildGmailComposeUrl(subject, body) {
  return `${gmailBaseUrl}&to=isthattvinn@gmail.com&su=${subject}&body=${body}`;
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const company = formData.get("company")?.toString().trim() || "";
  const website = formData.get("website")?.toString().trim() || "";
  const service = formData.get("service")?.toString().trim() || "";
  const budget = formData.get("budget")?.toString().trim() || "Not provided";
  const details = formData.get("details")?.toString().trim() || "";
  const legitInquiry = formData.get("legitInquiry");
  const companyFax = formData.get("companyFax")?.toString().trim() || "";
  const emailParts = email.split("@");
  const emailDomain = emailParts[1] || "";

  if (companyFax) {
    setFormMessage("This inquiry was blocked.");
    return;
  }

  if (!email.includes("@") || !emailDomain) {
    setFormMessage("Please use a valid email address.");
    return;
  }

  if (blockedDomains.includes(emailDomain)) {
    setFormMessage("Disposable email addresses are not allowed.");
    return;
  }

  if (looksLikeGibberish(name) || looksLikeGibberish(company)) {
    setFormMessage("Please use a real name and business or brand name.");
    return;
  }

  if (company.length < 2) {
    setFormMessage("Please enter a real business, brand, or project name.");
    return;
  }

  if (website.length < 3) {
    setFormMessage("Please include your website or Instagram handle.");
    return;
  }

  if (details.length < 40) {
    setFormMessage("Please add more detail so the inquiry looks serious and useful.");
    return;
  }

  if (!legitInquiry) {
    setFormMessage("Please confirm this is a real business inquiry.");
    return;
  }

  const subject = encodeURIComponent(`New Elevate Beyond Inquiry: ${service}`);
  const body = encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      `Business / Brand: ${company}`,
      `Website / Instagram: ${website}`,
      `Service Needed: ${service}`,
      `Budget / Amount: ${budget}`,
      "",
      "Situation:",
      details,
    ].join("\n")
  );

  setFormMessage("Looks good. Opening Gmail now.", false);
  window.location.href = buildGmailComposeUrl(subject, body);
});
