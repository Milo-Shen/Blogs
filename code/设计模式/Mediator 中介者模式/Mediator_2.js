function Test(name) {
    if (!this instanceof Test) {
        return new Test();
    } else {
        this.name = name;
    }
}