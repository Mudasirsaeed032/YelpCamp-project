const CampGround = require('../models/campGround');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding(
    {
        accessToken: mapBoxToken
    }
);
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render('../views/campgrounds/index', { campgrounds });
};


module.exports.new = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.newPost = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new CampGround(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.image = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }))
    campground.author = req.user._id;
    console.log(campground.geometry)
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.show = async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.editPut = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const camp = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    camp.image.push(...images);
    await camp.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
        console.log(camp);
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect('/campgrounds');
} 