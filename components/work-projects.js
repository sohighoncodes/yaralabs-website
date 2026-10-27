// Supplied case-study copy. Bar lengths are illustrative, not to scale.
export const WORK_PROJECTS = [
    { href: '/projects/colliers-catering', tag: 'CRM + lead gen', name: 'Colliers Catering', stack: 'Sydney · GoHighLevel, Google & Meta ads',
      stat: '~30', statLabel: 'leads a month, up from 1 a quarter',
      blurb: 'A corporate caterer with loyal clients but almost no online pipeline. We rebuilt how leads arrive, get answered and turn into orders.',
      metrics: [
        { label: 'New leads per month', before: '0.3', after: '~30', b: 1, a: 100, delta: '↑ 90×' },
        { label: 'Time to first reply', before: '2–3 hrs', after: '< 1 min', b: 100, a: 1, delta: '↓ 99%' }
      ] },
    { href: '/projects/us-medical-directors', tag: 'CRM migration', name: 'US Medical Directors', stack: 'USA · GoHighLevel, Stripe',
      stat: '8+ → 1', statLabel: 'apps replaced by one platform',
      blurb: 'USMD keeps med spas compliant. Their data lived in eight apps, so nobody could see what growth spending returned.',
      metrics: [
        { label: 'Apps to run the business', before: '8+ apps', after: '1 platform', b: 100, a: 12, delta: '↓ 88%' },
        { label: 'Manual payment checks', before: 'Every payment', after: '0', b: 100, a: 0, delta: 'Gone' }
      ] },
    { href: '/projects/inka-arthouse', tag: 'Business automation', name: 'Inka Arthouse', stack: 'AU, UK, US · Shopify, Make, Dropbox, Slack',
      stat: '4–5×', statLabel: 'revenue growth, without more manual work',
      blurb: 'A wall-art store printing in three countries. Preparing each batch by hand was the bottleneck holding growth back.',
      metrics: [
        { label: 'Revenue', before: '1×', after: '4–5×', b: 21, a: 100, delta: '↑ 4–5×' },
        { label: 'Separate print workflows', before: '3 sites', after: '1 workflow', b: 100, a: 33, delta: '3 → 1' }
      ] }
  ];
