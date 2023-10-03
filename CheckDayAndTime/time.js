module.exports = function (datetimeString) {
  const [, timePart] = datetimeString.split(" ");
  return timePart >= "17:00:00";
};
