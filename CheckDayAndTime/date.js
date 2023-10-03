module.exports = function (datetimeString) {
  const [datePart] = datetimeString.split(" ");

  const date = new Date(datePart);
  return date.getDay() === 0;
};
