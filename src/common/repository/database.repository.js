export const create = async ({
    model,
    data = [{}],
    options = {}
} = {}) => {
    return await model.create(data, options)
}

export const createOne = async ({
    model,
    data = {},
    options = {}
} = {}) => {
    const [doc] = await create({ model, data: [data], options })
    return doc
}

export const find = async ({
    model,
    filter = {},
    select = "",
    options = {}
} = {}) => {
    const doc = model.find(filter).select(select)

    if (options.populate) doc.populate(options.populate)
    if (options.skip) doc.skip(options.skip)
    if (options.limit) doc.limit(options.limit)
    if (options.sort) doc.sort(options.sort)
    if (options.lean) doc.lean(options.lean)

    return await doc.exec()
}

export const countDocuments = async ({
    model,
    filter = {},
    options = {}
} = {}) => {
    return await model.countDocuments(filter, options).exec()
}

export const paginate = async ({
    model,
    filter = {},
    select = "",
    options = {},
    page = 1,
    limit = 5
}) => {
    const skip = (page - 1) * limit
    const countData = await countDocuments({ model })
    const pages = Math.ceil(countData / limit)
    const data = await find({
        model,
        filter,
        options: {
            ...options,
            skip,
            limit,
        },
        select
    })
    return { pages, page, limit, data }
}

export const findOne = async ({
    model,
    filter = {},
    select = "",
    options = {}
} = {}) => {
    const doc = model.findOne(filter).select(select)

    if (options.populate) doc.populate(options.populate)
    if (options.lean) doc.lean(options.lean)

    return await doc.exec()
}

export const findById = async ({
    model,
    id,
    select = "",
    options = {}
} = {}) => {
    const doc = model.findById(id).select(select)

    if (options.populate) doc.populate(options.populate)
    if (options.lean) doc.lean(options.lean)

    return await doc.exec()
}


export const exists = async ({
    model,
    filter = {}
} = {}) => {
    return await model.exists(filter)
}

export const findByIdAndUpdate = async ({
    model,
    id,
    update = {},
    options = {}
} = {}) => {
    return await model.findByIdAndUpdate(
        id,
        {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        },
        {
            returnDocument: "after",
            runValidators: true,
            ...options
        }
    ).exec()
}

export const findOneAndUpdate = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.findOneAndUpdate(
        filter,
        {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        },
        {
            returnDocument: "after",
            runValidators: true,
            ...options
        }
    ).exec()
}

export const updateOne = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.updateOne(
        filter,
        {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        },
        {
            runValidators: true,
            ...options
        }
    ).exec()
}

export const updateMany = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.updateMany(
        filter,
        {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        },
        {
            runValidators: true,
            ...options
        }
    ).exec()
}

export const findOneAndReplace = async ({
    model,
    filter = {},
    update = {},
    options = {}
} = {}) => {
    return await model.findOneAndReplace(
        filter,
        {
            ...update,
            $inc: {
                ...(update.$inc || {}),
                versionData: 1
            }
        },
        {
            returnDocument: "after",
            runValidators: true,
            ...options
        }
    ).exec()
}

export const findByIdAndDelete = async ({
    model,
    id,
    options = {}
} = {}) => {
    return await model.findByIdAndDelete(
        id,
        {
            returnDocument: "after",
            ...options
        }
    ).exec()
}

export const findOneAndDelete = async ({
    model,
    filter = {},
    options = {}
} = {}) => {
    return await model.findOneAndDelete(
        filter,
        {
            returnDocument: "after",
            ...options
        }
    ).exec()
}

export const deleteOne = async ({
    model,
    filter = {},
    options = {}
} = {}) => {
    return await model.deleteOne(
        filter,
        {
            ...options
        }
    ).exec()
}

export const deleteMany = async ({
    model,
    filter = {},
    options = {}
} = {}) => {
    return await model.deleteMany(
        filter,
        {
            ...options
        }
    ).exec()
}

export const aggregate = async ({
    model,
    pipeline = [],
    options = {}
} = {}) => {
    const query = model.aggregate(pipeline)

    if (Object.keys(options).length > 0) {
        query.option(options)
    }

    return await query.exec()
}