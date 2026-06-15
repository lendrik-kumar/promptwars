const express = require('express');
const { complete, parseJSON } = require('../services/groq');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { itinerary } = req.body;
    if (!itinerary) {
      return res.status(400).json({ success: false, error: 'Missing itinerary text' });
    }

    const systemPrompt = `You are a carbon footprint analyzer specialized in Indian travel routes.
Given a travel itinerary snippet (e.g. flight PNR text, train ticket SMS, or just a route like 'DEL to BOM'), estimate the distance in KM and calculate the carbon footprint.

Assume standard carbon factors:
- Domestic Flight: ~0.14 kg CO2 per km
- Indian Railways (Train): ~0.03 kg CO2 per km
- Bus: ~0.05 kg CO2 per km

If the input is vague, make a reasonable guess based on major Indian cities.
You MUST reply with ONLY a JSON object in this exact schema:
{
  "mode": "Flight" | "Train" | "Bus",
  "route": "City A to City B",
  "distanceKm": number,
  "carbonKg": number,
  "swap": {
    "description": "Suggestion for a greener alternative",
    "carbonSavedKg": number,
    "moneySavedINR": number
  }
}`;

    const raw = await complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: itinerary }
    ], { json: true, temperature: 0.1 });
    const parsedData = parseJSON(raw);

    // Apply some sensible fallbacks in case AI misses fields
    const result = {
      mode: parsedData.mode || 'Unknown',
      route: parsedData.route || 'Unknown Route',
      distanceKm: parsedData.distanceKm || 0,
      carbonKg: parsedData.carbonKg || 0,
      swap: {
        description: parsedData.swap?.description || 'Take a train instead for lower emissions.',
        carbonSavedKg: parsedData.swap?.carbonSavedKg || 0,
        moneySavedINR: parsedData.swap?.moneySavedINR || 0,
      }
    };

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
