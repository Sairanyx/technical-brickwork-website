// src/components/footer.js
// Statutory company disclosure + legal links.
// Rendered from one place so the details can't drift between pages.

export const COMPANY = {
  name:      'Technical Brickwork Ltd',
  number:    '11111932',
  vat:       'GB 406 579 578',
  address:   '14 Rusland Park Road, Harrow, HA1 1UT',
  email:     'info@technicalbrickwork.co.uk',
  phone:     '+44 743 803 1478',
  phoneHref: '+447438031478'
}

export function renderFooter(el) {
  if (!el) return

  el.innerHTML = `
    <div class="footer-inner">
      <div class="footer-top">
        <a href="/" class="footer-logo">
          <img src="/images/logo.png" alt="Technical Brickwork" />
          <span>Technical Brickwork</span>
        </a>
        <nav class="footer-links">
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/cookies">Cookie Policy</a>
          <a href="/terms">Website Terms</a>
        </nav>
      </div>

      <div class="footer-legal">
        <p>
          <strong>${COMPANY.name}</strong> &middot; Registered in England and Wales &middot;
          Company No. ${COMPANY.number} &middot; VAT No. ${COMPANY.vat}
        </p>
        <p>Registered office: ${COMPANY.address}</p>
        <p class="footer-copy">
          &copy; <span id="footer-year">${new Date().getFullYear()}</span>
          ${COMPANY.name}. All rights reserved.
        </p>
      </div>
    </div>
  `
}
