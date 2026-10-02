/**
 * Placeholder photography (Unsplash). Swap any entry for the gym's own
 * photos (e.g. Supabase Storage public URLs or /public files) — every
 * section reads its imagery from here or from the database.
 */
const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const px = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const media = {
  hero: u("photo-1534438327276-14e5300c3a48", 2400),
  heroAlt: u("photo-1517836357463-d25dfeac3438", 2000),
  about: u("photo-1540497077202-7c8a3999166f", 1600),
  aboutDetail: u("photo-1571902943202-507ec2618e8f", 1200),
  // About collage: Unsplash + Pexels (both free-to-use licences)
  aboutCollage: [u("photo-1584466977773-e625c37cdd50", 1000), px(1552242), u("photo-1593079831268-3381b0db4a77", 1200), px(260352, 1000)],
  trial: u("photo-1583454110551-21f2fa2afe61", 2000),
  contact: u("photo-1574680096145-d05b474e2155", 2000),
  og: u("photo-1534438327276-14e5300c3a48", 1200),

  programs: {
    strength: u("photo-1541534741688-6078c6bfb5c5", 1200),
    muscle: u("photo-1581009146145-b5ef050c2e1e", 1200),
    weightLoss: u("photo-1476480862126-209bfaa8edc8", 1200),
    functional: u("photo-1599058917212-d750089bc07e", 1200),
    hiit: u("photo-1517963879433-6ad2b056d712", 1200),
    personal: u("photo-1571019613454-1cb2f99b2d8b", 1200),
    cross: u("photo-1526506118085-60ce8714f8c5", 1200),
    mobility: u("photo-1544367567-0f2fcb009e0b", 1200),
    sports: u("photo-1552674605-db6ffd4facb5", 1200),
  },

  trainers: {
    arjun: u("photo-1567013127542-490d757e51fc", 900),
    meera: u("photo-1594381898411-846e7d193883", 900),
    kabir: u("photo-1507003211169-0a1dd7228f2d", 900),
    zara: u("photo-1584735935682-2f2b69dff9d2", 900),
    vikram: u("photo-1500648767791-00dcc994a43e", 900),
    ananya: u("photo-1518611012118-696072aa579a", 900),
  },

  people: {
    p1: u("photo-1506794778202-cad84cf45f1d", 400),
    p2: u("photo-1438761681033-6461ffad8d80", 400),
    p3: u("photo-1500648767791-00dcc994a43e", 400),
    p4: u("photo-1494790108377-be9c29b29330", 400),
    p5: u("photo-1544005313-94ddf0286df2", 400),
    p6: u("photo-1507003211169-0a1dd7228f2d", 400),
  },

  facilities: {
    weights: u("photo-1534438327276-14e5300c3a48", 1400),
    cardio: u("photo-1576678927484-cc907957088c", 1400),
    functional: u("photo-1599058917212-d750089bc07e", 1400),
    lockers: u("photo-1623874514711-0f321325f318", 1400),
    shower: u("photo-1558611848-73f7eb4001a1", 1400),
    pt: u("photo-1571019613454-1cb2f99b2d8b", 1400),
    recovery: u("photo-1544367567-0f2fcb009e0b", 1400),
    parking: u("photo-1573348722427-f1d6819fdf98", 1400),
    water: u("photo-1523362628745-0c100150b504", 1400),
  },

  blog: {
    b1: u("photo-1517836357463-d25dfeac3438", 1200),
    b2: u("photo-1490645935967-10de6ba17061", 1200),
    b3: u("photo-1476480862126-209bfaa8edc8", 1200),
    b4: u("photo-1581009146145-b5ef050c2e1e", 1200),
    b5: u("photo-1512621776951-a57141f2eefd", 1200),
    b6: u("photo-1544367567-0f2fcb009e0b", 1200),
  },

  gallery: [
    u("photo-1534438327276-14e5300c3a48", 1400),
    u("photo-1540497077202-7c8a3999166f", 1400),
    u("photo-1571902943202-507ec2618e8f", 1400),
    u("photo-1605296867304-46d5465a13f1", 1400),
    u("photo-1517836357463-d25dfeac3438", 1400),
    u("photo-1581009146145-b5ef050c2e1e", 1400),
    u("photo-1571019613454-1cb2f99b2d8b", 1400),
    u("photo-1549719386-74dfcbf7dbed", 1400),
    u("photo-1599058917212-d750089bc07e", 1400),
    u("photo-1518611012118-696072aa579a", 1400),
    u("photo-1541534741688-6078c6bfb5c5", 1400),
    u("photo-1574680096145-d05b474e2155", 1400),
    u("photo-1583454110551-21f2fa2afe61", 1400),
    u("photo-1594381898411-846e7d193883", 1400),
    u("photo-1576678927484-cc907957088c", 1400),
    u("photo-1526506118085-60ce8714f8c5", 1400),
  ],
};
