# umamusume-gacha-history
- 马娘抽卡记录只保存7天，非常不友好。使用本项目即可将马娘抽卡记录同步到服务器，方便统计。



## 前端

- 本人不会前端，是现学的。

- 使用 React + Typescript + Vite

### 开发前准备

- 首先确保您的电脑安装了赛马娘 DMM 版，并且下载好了资源
- 安装 Python 包

```shell
pip install UnityPy
```

- 运行 `extract_res.py`

```shell
python extract_res.py
```

- 运行之后，会将游戏内需要的图片资源提取到 `extracted_res` 文件夹内。将 `extracted_res` 文件夹复制到 `public` 内，将 `extracted_res` 文件夹重命名为 `img` 即可

- 安装调试/构建所需环境

```shell
npm install
```



### 调试

```shell
npm run dev
```



### 构建

```shell
npm run build
```



## 后端

- 修改 `keys.example.py` 内的 `KEY` 和 `IV`，然后将 `keys.example.py` 重命名为 `keys.py`

- 环境安装

```shell
pip install -r requirements.txt
```

- 运行服务

```shell
python main.py
```

