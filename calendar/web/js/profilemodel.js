
function ProfileModel(storage) {
    this.storage = storage;
}

ProfileModel.prototype.amSignedIn = function() {
    return this.storage.hasToken();
}

export { ProfileModel };