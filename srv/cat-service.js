const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { Books } = this.entities;

  /**
   * Handles the UploadBooks action to bulk insert books into the Books entity.
   * @param {import('@sap/cds').Request} req The incoming request containing items.
   * @returns {number} The number of records inserted.
   */
  this.on('UploadBooks', async (req) => {
    const { items } = req.data;

    // Return an error if no items were provided
    if (!Array.isArray(items) || items.length === 0) {
      return req.error(400, 'No records were provided');
    }

    // Validate each item and collect errors
    items.forEach((item, index) => {
      // Validate that title exists and is a non-empty string
      if (typeof item.title !== 'string') {
        req.error(400, `Row ${index + 1}: 'title' must be a string`);
      }
      if (item.title.trim().length === 0) {
        req.error(400, `Row ${index + 1}: 'title' cannot be empty`);
      }
      // Business rule: title should have at least 3 characters
      if (item.title.trim().length < 3) {
        req.error(400, `Row ${index + 1}: 'title' must be at least 3 characters long`);
      }

      // Validate that stock is a number
      if (typeof item.stock !== 'number') {
        req.error(400, `Row ${index + 1}: 'stock' must be a number`);
      }
      // Validate that stock is an integer
      if (!Number.isInteger(item.stock)) {
        req.error(400, `Row ${index + 1}: 'stock' must be an integer`);
      }
      // Business rule: stock cannot be negative
      if (item.stock < 0) {
        req.error(400, `Row ${index + 1}: 'stock' cannot be negative`);
      }
    });

    // Optional: check for duplicate titles in the payload
    const titles = items.map(i => i.title.trim().toLowerCase());
    const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
    if (duplicates.length > 0) {
      return req.error(400, `Duplicate titles found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Insert all valid items in a single transaction
    const tx = cds.transaction(req);
    await tx.run(
      INSERT.into(Books).entries(
        items.map(item => ({
          title: item.title.trim(),
          stock: item.stock,
          IsActiveEntity: true
        }))
      )
    );

    // Return how many records were inserted
    return items.length;
  });
});
