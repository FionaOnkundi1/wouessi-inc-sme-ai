const micButton = document.getElementById("micButton");
const micStatus = document.getElementById("micStatus");
const businessInput = document.getElementById("businessInput");
const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");
const errorMessage = document.getElementById("errorMessage");
const loadingState = document.getElementById("loadingState");

const previewName = document.getElementById("previewName");
const previewType = document.getElementById("previewType");
const previewTagline = document.getElementById("previewTagline");
const previewDescription = document.getElementById("previewDescription");
const previewProducts = document.getElementById("previewProducts");
const previewLocation = document.getElementById("previewLocation");
const previewCustomers = document.getElementById("previewCustomers");
const previewUsp = document.getElementById("previewUsp");
const confidenceBadge = document.getElementById("confidenceBadge");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-AU";

  recognition.onstart = () => {
    isListening = true;
    micButton.textContent = "Stop microphone";
    micStatus.textContent = "Listening...";
    errorMessage.textContent = "";
  };

  recognition.onend = () => {
    isListening = false;
    micButton.textContent = "Start microphone";
    micStatus.textContent = "Microphone idle";
  };

  recognition.onerror = () => {
    errorMessage.textContent = "Microphone access failed. Please type your business idea instead.";
    micStatus.textContent = "Microphone unavailable";
  };

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    businessInput.value = transcript.trim();
  };
} else {
  micButton.disabled = true;
  micStatus.textContent = "Speech recognition not supported";
}

micButton.addEventListener("click", () => {
  if (!recognition) {
    errorMessage.textContent = "Your browser does not support speech recognition. Please type instead.";
    return;
  }

  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

generateButton.addEventListener("click", () => {
  const input = businessInput.value.trim();

  if (input.length < 10) {
    errorMessage.textContent = "Please enter a longer business description before generating.";
    return;
  }

  errorMessage.textContent = "";
  loadingState.classList.remove("hidden");

  setTimeout(() => {
    const generatedWebsite = buildPreviewFromInput(input);
    renderPreview(generatedWebsite);
    loadingState.classList.add("hidden");
  }, 700);
});

clearButton.addEventListener("click", () => {
  businessInput.value = "";
  errorMessage.textContent = "";
  loadingState.classList.add("hidden");
});

function buildPreviewFromInput(input) {
  const lowerInput = input.toLowerCase();

  const location = findLocation(input);
  const product = findProduct(lowerInput);
  const customer = findCustomer(lowerInput);
  const businessName = createBusinessName(product, location);

  return {
    name: businessName,
    type: product,
    tagline: `Helping ${customer.toLowerCase()} with reliable ${product.toLowerCase()}`,
    description: input,
    products: product,
    location: location,
    customers: customer,
    usp: "Simple, friendly, and locally focused service",
    confidence: "frontend prototype"
  };
}

function findLocation(input) {
  const locations = ["Melbourne", "Sydney", "Brisbane", "Adelaide", "Perth", "Canberra", "Hobart", "Darwin"];

  for (const location of locations) {
    if (input.toLowerCase().includes(location.toLowerCase())) {
      return location;
    }
  }

  return "Local Area";
}

function findProduct(input) {
  if (input.includes("candle")) {
    return "Handmade Candles";
  }

  if (input.includes("coffee")) {
    return "Coffee and Drinks";
  }

  if (input.includes("clean")) {
    return "Cleaning Services";
  }

  if (input.includes("food") || input.includes("restaurant") || input.includes("cafe")) {
    return "Food and Hospitality";
  }

  if (input.includes("hair") || input.includes("beauty")) {
    return "Beauty Services";
  }

  if (input.includes("fitness") || input.includes("gym")) {
    return "Fitness Services";
  }

  return "Business Services";
}

function findCustomer(input) {
  if (input.includes("student")) {
    return "Students";
  }

  if (input.includes("family") || input.includes("families")) {
    return "Families";
  }

  if (input.includes("gift")) {
    return "Gift buyers";
  }

  if (input.includes("business")) {
    return "Small businesses";
  }

  return "Local customers";
}

function createBusinessName(product, location) {
  if (location === "Local Area") {
    return product;
  }

  return `${location} ${product}`;
}

function renderPreview(data) {
  previewName.textContent = data.name;
  previewType.textContent = data.type;
  previewTagline.textContent = data.tagline;
  previewDescription.textContent = data.description;
  previewProducts.textContent = data.products;
  previewLocation.textContent = data.location;
  previewCustomers.textContent = data.customers;
  previewUsp.textContent = data.usp;
  confidenceBadge.textContent = `confidence: ${data.confidence}`;
}