"use strict";
// Region pages contain static validated scientific references, not live telemetry.
const referenceEl=document.getElementById('reference');
if(referenceEl){try{const data=JSON.parse(referenceEl.textContent);if(!data.regionId||!Array.isArray(data.sourceUrls))throw new Error('Invalid region reference');}catch(err){console.warn('Region reference metadata not available',err);}}
