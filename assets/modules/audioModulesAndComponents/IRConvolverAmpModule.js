const basePath =
  "https://api.github.com/repos/blosmusic/fx-chain/contents/assets/ampIRs"; // GitHub API path to the amp IRs
const headers = {
  Accept: "application/vnd.github.v3+json",
};
const ampType = document.getElementById("amp-type");

let convolver = new Tone.Convolver();
const inputGain = new Tone.Gain(inputGainValue);
const eq = new Tone.EQ3(eqBass, eqMid, eqTreble);
const outputGain = new Tone.Gain(outputGainValue);
const globalVolume = new Tone.Volume(globalVolumeValue);

// Add IRs to the select element
function getAmpIRs() {
  fetch(basePath, { headers })
    .then((response) => response.json())
    .then((data) => {
      // Filter out the WAV files from the API response
      const wavFiles = data.filter((item) => item.name.endsWith(".wav"));

      // Iterate through the filtered WAV files and add them to the select menu
      wavFiles.forEach((file) => {
        const option = document.createElement("option");
        option.value = file.download_url;
        option.textContent = file.name.substring(0, file.name.length - 4);
        ampType.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error getting amp IRs:", error);
    });
}
getAmpIRs();

// Handle amp type change
ampType.addEventListener("change", async () => {
  convolver.dispose();

  // Get the selected amp type
  const selectedAmpType = ampType.value;
  console.log("Amp IR:", selectedAmpType);

  // Load the impulse response from the selected file
  const impulseResponse = new Tone.Buffer(selectedAmpType, () => {
    // Set the loaded impulse response to the convolver
    convolver.buffer = impulseResponse;

    //bypass convolver if no amp type is selected
    if (ampType.value === "") {
      globalVolume.connect(meter);
      setInterval(() => console.log(meter.getValue()), 100);
    } else {
      convolver = new Tone.Convolver(impulseResponse);
      globalVolume.connect(convolver);
      convolver.connect(meter);
    }
  });
});
