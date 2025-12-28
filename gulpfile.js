const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

function copyIcons() {
  return src('nodes/**/*.png').pipe(dest('dist/nodes'));
}

exports['build:icons'] = async function () {
  await buildIcons();
  await copyIcons();
};
