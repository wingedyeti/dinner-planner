const MEALS_SHEET_NAME = "Meals";
const RESTAURANTS_SHEET_NAME = "Restaurants";

const MEAL_HEADERS = ["id", "name", "cookingMethod", "cuisine", "notes", "dateAdded"];
const RESTAURANT_HEADERS = [
  "id",
  "name",
  "type",
  "cuisine",
  "priceRange",
  "location",
  "rating",
  "notes",
  "dateAdded"
];

function doGet() {
  try {
    return jsonResponse_({
      ok: true,
      meals: readRecords_(MEALS_SHEET_NAME, MEAL_HEADERS),
      restaurants: readRecords_(RESTAURANTS_SHEET_NAME, RESTAURANT_HEADERS)
    });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const meals = Array.isArray(payload.meals) ? payload.meals : [];
    const restaurants = Array.isArray(payload.restaurants) ? payload.restaurants : [];

    writeRecords_(MEALS_SHEET_NAME, MEAL_HEADERS, meals);
    writeRecords_(RESTAURANTS_SHEET_NAME, RESTAURANT_HEADERS, restaurants);

    return jsonResponse_({
      ok: true,
      message: "Data saved",
      mealsCount: meals.length,
      restaurantsCount: restaurants.length
    });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  return JSON.parse(e.postData.contents);
}

function readRecords_(sheetName, headers) {
  const sheet = getOrCreateSheet_(sheetName, headers);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    })
    .filter((record) => String(record.name || "").trim() !== "");
}

function writeRecords_(sheetName, headers, records) {
  const sheet = getOrCreateSheet_(sheetName, headers);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (!records.length) {
    return;
  }

  const rows = records.map((record) =>
    headers.map((header) => (record && record[header] !== undefined && record[header] !== null ? record[header] : ""))
  );
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function getOrCreateSheet_(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const mismatch = headers.some((header, index) => String(currentHeaders[index] || "").trim() !== header);
    if (mismatch) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
