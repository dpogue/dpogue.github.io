module.exports = {
  build: {
    srcPath: './src',
    outputPath: './www',
    cleanUrls: false
  },
  site: {
    title:  process.env.npm_package_name,
    host:   process.env.npm_package_homepage
  }
};
