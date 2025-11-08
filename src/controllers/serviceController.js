const Category = require("../models/category");
const Service = require("../models/service");
const ServicePriceOption = require("../models/servicePriceOption");

async function createService(req, res) {
  try {
    const { categoryId } = req.params;
    const { name, type, priceOptions } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    if (!["Normal", "VIP"].includes(type)) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    const service = await Service.create({
      category: categoryId,
      name: name.trim(),
      type,
    });

    if (Array.isArray(priceOptions) && priceOptions.length > 0) {
      const options = priceOptions.map((po) => ({
        service: service._id,
        duration: po.duration,
        price: po.price,
        type: po.type,
      }));
      await ServicePriceOption.insertMany(options);
    }

    const created = await Service.findById(service._id).lean();
    const createdPriceOptions = await ServicePriceOption.find({
      service: service._id,
    }).lean();

    return res.status(201).json({
      ...created,
      priceOptions: createdPriceOptions,
    });
  } catch (err) {
    console.error("Error creating service:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listServices(req, res) {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const services = await Service.find({ category: categoryId }).lean();
    const servicesWithOptions = await Promise.all(
      services.map(async (s) => {
        const priceOptions = await ServicePriceOption.find({
          service: s._id,
        }).lean();
        return { ...s, priceOptions };
      })
    );

    return res.json(servicesWithOptions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteService(req, res) {
  try {
    const { categoryId, serviceId } = req.params;

    if (!categoryId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Category ID and Service ID are required",
      });
    }

    const svc = await Service.findOne({ _id: serviceId, category: categoryId });
    // console.log("svc----------------------------", svc);

    if (!svc) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    await ServicePriceOption.deleteMany({ service: svc._id });
    await Service.deleteOne({ _id: svc._id });

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    console.error("Delete Service Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function updateService(req, res) {
  try {
    const { categoryId, serviceId } = req.params;
    const { name, type, priceOptions, removePriceOptionIds } = req.body;

    const svc = await Service.findOne({ _id: serviceId, category: categoryId });
    if (!svc) return res.status(404).json({ message: "Service not found" });

    if (name) svc.name = name;
    if (type) {
      if (!["Normal", "VIP"].includes(type))
        return res.status(400).json({ message: "Invalid service type" });
      svc.type = type;
    }
    await svc.save();

    if (Array.isArray(priceOptions)) {
      for (const po of priceOptions) {
        if (po.id) {
          const existing = await ServicePriceOption.findOne({
            _id: po.id,
            service: serviceId,
          });
          if (existing) {
            existing.duration = po.duration ?? existing.duration;
            existing.price = po.price ?? existing.price;
            if (po.type && ["Hourly", "Weekly", "Monthly"].includes(po.type))
              existing.type = po.type;
            await existing.save();
          }
        } else {
          if (!po.duration || typeof po.price === "undefined" || !po.type) {
            continue;
          }
          await ServicePriceOption.create({
            service: serviceId,
            duration: po.duration,
            price: po.price,
            type: po.type,
          });
        }
      }
    }

    if (Array.isArray(removePriceOptionIds) && removePriceOptionIds.length) {
      await ServicePriceOption.deleteMany({
        _id: { $in: removePriceOptionIds },
        service: serviceId,
      });
    }

    const updated = await Service.findById(serviceId).lean();
    const updatedPriceOptions = await ServicePriceOption.find({
      service: serviceId,
    }).lean();

    return res.json({ ...updated, priceOptions: updatedPriceOptions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createService, listServices, deleteService, updateService };
