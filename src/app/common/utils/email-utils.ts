// src/app/common/utils/email-utils.ts

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class EmailUtils {
  // static decodeAndFormatBody(raw: string, sanitizer: DomSanitizer ): SafeHtml {
  //   if (!raw) return '';

  //   const parser = new DOMParser();
  //   let decoded = parser.parseFromString(raw, 'text/html').documentElement.innerHTML || '';

  //   const emailLink = (email: string) =>
  //     `&lt;<a href="mailto:${email}">${email}</a>&gt;`;

  //   // Replace various email formats inside <>
  //   decoded = decoded.replace(
  //     /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:<mailto:\1>)?>?/gi,
  //     (_match, email) => emailLink(email)
  //   );

  //   decoded = decoded.replace(
  //     /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\1*>>/g,
  //     (_match, email) => emailLink(email)
  //   );

  //   decoded = decoded.replace(
  //     /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g,
  //     (_match, email) => emailLink(email)
  //   );

  //   // Convert plain email addresses into mailto links
  //   decoded = decoded.replace(
  //     /([^"'>])\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
  //     (_match, prefix, email) => `${prefix}<a href="mailto:${email}">${email}</a>`
  //   );

  //   // Bold key headers
  //   const headers = ['From', 'To', 'Subject', 'Sent'];
  //   for (const header of headers) {
  //     const regex = new RegExp(`^(\\s*${header}:)`, 'gm');
  //     decoded = decoded.replace(regex, '<b>$1</b>');
  //   }

  //   // Convert newlines and HTML space entities
  //   decoded = decoded
  //     .replace(/(?:\r\n|\r|\n)/g, '<br>')
  //     .replace(/&nbsp;|\u00A0/g, ' ');

  //   return sanitizer.bypassSecurityTrustHtml(decoded);
  // }

  static decodeAndFormatlistBody(body: string): SafeHtml {
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
    let plainText = body;
    if (isHtml) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = body;
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    }

    return plainText.length > 100
      ? plainText.slice(0, 100).trim() + "..."
      : plainText;
  }
}
