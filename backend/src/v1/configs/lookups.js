const LookupCategory = {
  $lookup: {
    from: "categories", // foreign collection name
    localField: "categoryId",
    foreignField: "_id",
    as: "category", // alias
  },
};

const LookupSupplier = {
  $lookup: {
    from: "suppliers", // foreign collection name
    localField: "supplierId",
    foreignField: "_id",
    as: "supplier", // alias
  },
};

const LookupTransportation = {
  $lookup: {
    from: "transportations", // foreign collection name
    localField: "transportationId",
    foreignField: "_id",
    as: "transportation", // alias
  },
};

module.exports = {
  LookupCategory,
  LookupSupplier,
  LookupTransportation,
};
