/**
 * This file is part of Perhelukudiplomi data converter.
 *
 * @author Miika Koskela <miika.s.koskela@gmail.com>
 * @copyright 2020 Tampereen kaupunginkirjasto
 * @license MIT
 */
(function () {

  // TODO: Map to column names which will be used on JSON
  const columnMap = {
    "author": 0
  };

  const files = document.querySelector("input[type='file']");
  files.addEventListener("change", function (event) {

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split("\n");

      // These are some header lines
      lines.shift();
      lines.shift();

      for (let i = 0; i < lines.length; i++) {
        const element = lines[i];
        const columns = element.split('\t');
      }

    };

    reader.readAsText(event.target.files[0]);

  });
})();