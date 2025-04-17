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

    // Basic validation for each item
    items.forEach((item, index) => {
      if (!item.title) {
        req.error(400, `Row ${index + 1}: missing 'title'`);
      }
      if (isNaN(item.stock)) {
        req.error(400, `Row ${index + 1}: 'stock' is not numeric`);
      }
    });

    // Insert all items in a single transaction
    const tx = cds.transaction(req);
    await tx.run(
      INSERT.into(Books).entries(
        items.map(item => ({
          title: item.title,
          stock: item.stock,
          IsActiveEntity: true
        }))
      )
    );

    // Return how many records were inserted
    return items.length;
  });
});
