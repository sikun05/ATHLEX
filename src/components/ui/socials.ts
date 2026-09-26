import { site, whatsappLink } from "@/lib/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, XIcon, YoutubeIcon } from "./social-icons";

export const socials = [
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.x, label: "X", Icon: XIcon },
  { href: whatsappLink(), label: "WhatsApp", Icon: WhatsAppIcon },
];
