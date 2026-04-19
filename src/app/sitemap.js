export default function sitemap() {
  const baseUrl = 'https://www.cupangklaten.my.id';
  
  const routes = [
    '',
    '/stok',
    '/faq',
    '/cara-order',
    '/tips-perawatan',
    '/jantan-vs-betina',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
