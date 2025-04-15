// 简写
let obj = {
    * myGeneratorMethod(){
        ...
    }
};

// 完整写法
let obj = {
    myGeneratorMethod: function* () {
        ...
    }
}