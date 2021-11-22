const fs = require("fs")
const path = require("path")
const send = require("koa-send")
//用户路由
const Router = require('@koa/router')
const router = new Router()

const FILES_BASE_PATH = "./resources"

//统一路径前缀
router.prefix("/api")

// 提供路径API接口和资源文件
router.get('/dir/:pathMatch(.*)*',async ctx => {
    let tgt_path = path.join(FILES_BASE_PATH, ctx.params.pathMatch === undefined ? '' : ctx.params.pathMatch)
    let validated_path = await validate_path(tgt_path)

    if(validated_path === "not a valid directory"){
        ctx.type = "JSON"
        ctx.body = {
            code: -1,
            data: []
        }
    }else if(!validated_path){
        // 资源文件
        ctx.attachment(tgt_path)
        await send(ctx, tgt_path)
    }
    else{
        ctx.type = "JSON"
        // 文件夹
        ctx.body = {
            code: 1,
            data: read_dir_all_infos(tgt_path)
        }
    }

})

// 验证路径是否合法 - 若路径不存在或者路径是文件则判定为不合法
let validate_path = async (_path) => {
    return new Promise((resolve, reject) => {
        fs.stat(_path, (err, stat) => {
            if(err)
                resolve("not a valid directory")
            else
                resolve(stat.isDirectory())
        })
    })
}

// 读取路径下的所有信息
let read_dir_all_infos = (_path) => {
    let dirInfosObj = []
    
    fs.readdirSync(_path).forEach((name) => {
        let stat = fs.statSync(path.join(_path, name))
        
        let info = {
            "name": name,
            "isDir": stat.isFile() ? 0 : 1,
            "size": stat.isFile() ? format_size_output(stat.size) : "-1"
        }
        dirInfosObj.push(info)
    })

    return dirInfosObj
}

// 对文件大小进行简洁输出
let format_size_output = (size) => {
    let scales = ["B", "KB", "MB", "GB"]
    let res = 0
    let index = 0

    do{
        res = size
        index++
    }while((size /= 1024) > 1)

    return res.toFixed(2) + scales[--index]
}

module.exports = router