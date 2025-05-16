export default async function handler(req, res) {
  const sku = req.query.sku;
  if (!sku) {
    return res.status(400).json({ status: "error", message: "SKU is required" });
  }

  try {
    const response = await fetch(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(sku)}&LH_Sold=1&LH_Complete=1`);
    const html = await response.text();

    const priceMatches = [...html.matchAll(/\$([0-9,.]+)</g)];
    const prices = priceMatches.map(match => parseFloat(match[1].replace(/,/g, ""))).filter(p => p > 10);

    if (prices.length === 0) {
      return res.status(404).json({ status: "error", message: "No valid prices found" });
    }

    const avgPrice = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
    const salesVolume = prices.length;

    return res.status(200).json({
      status: "success",
      avgPrice,
      salesVolume
    });

  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}
