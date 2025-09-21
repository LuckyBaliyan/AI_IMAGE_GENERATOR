document.addEventListener("DOMContentLoaded",()=>{
    const themeToggle = document.querySelector(".theme-toggle");
    const promptBtn = document.querySelector(".prompt-btn");
    

    const promptForm = document.querySelector(".prompt-form");
    const inputField = document.querySelector(".prompt-input");

    const modelSelect = document.querySelector("#model-select");
    const countSelect = document.querySelector("#count-select");
    const ratioSelect = document.querySelector("#aspect-select");

    const gridGallery = document.querySelector(".gallery-grid");
    const generateBtn = document.querySelector(".generate-btn");

   const API_KEY3 = config.API_KEY;


    const examplePrompts = [
        "A magic forest with glowing plants and fairy homes among giant mushrooms",
        "An old steampunk airship floating through golden clouds at sunset",
        "A future Mars colony with glass domes and gardens against red mountains",
        "A dragon sleeping on gold coins in a crystal cave",
        "An underwater kingdom with merpeople and glowing coral buildings",
        "A floating island with waterfalls pouring into clouds below",
        "A witch's cottage in fall with magic herbs in the garden",
        "A robot painting in a sunny studio with art supplies around it",
        "A magical library with floating glowing books and spiral staircases",
        "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
        "A cosmic beach with glowing sand and an aurora in the night sky",
        "A medieval marketplace with colorful tents and street performers",
        "A cyberpunk city with neon signs and flying cars at night",
        "A peaceful bamboo forest with a hidden ancient temple",
        "A giant turtle carrying a village on its back in the ocean",
    ];

    (()=>{
       const savedTheme = localStorage.getItem("theme");
       const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

       const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
       document.body.classList.toggle("dark-theme",isDarkTheme);
       themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" :
       "fa-solid fa-moon";
    })();

    const toggleTheme = ()=>{
       const isDarkTheme =  document.body.classList.toggle("dark-theme");
       localStorage.setItem("theme",isDarkTheme ? "dark" : "light");
       themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" :
       "fa-solid fa-moon";

    }

    const getImageDimensions = (ratio, baseSize = 512) => {
        const [width, height] = ratio.split("/").map(Number);
        const scalerFactor = baseSize / Math.sqrt(width * height);

        let calculatedWidth = Math.round(width * scalerFactor);
        let calculatedHeight = Math.round(height * scalerFactor);
        
        calculatedWidth = Math.floor(calculatedWidth / 16) * 16; 
        calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

        return {width: calculatedWidth, height: calculatedHeight};
    };

    const updateImageCrads = (imgIndex, imageUrl) => {
        const imageCard = document.querySelector(`#img-card-${imgIndex}`);
        if(!imageCard) return;

        imageCard.classList.remove("loading");
        imageCard.innerHTML = ` <img src="${imageUrl}" alt="" class="result-img">
                        <div class="img-overlay">
                            <a href="${imageUrl}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
    }

    const generateImages = async (Selectedmodel, count, ratio, promptText) => {
        const MODEL_URL = `https://api-inference.huggingface.co/models/${Selectedmodel}`;
        const { width, height } = getImageDimensions(ratio);
        generateBtn.setAttribute("disabled", "true");

        const imagePromises = Array.from({ length: count }, async (_, index) => {
             try{
            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY3}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: {
                        width,height
                    },
                    options:{wait_for_model: true, user_cache: false},
          }),
       });

       if(!response.ok) throw new Error((await response.json())?.error);

     const result = await response.blob();
     updateImageCrads(index, URL.createObjectURL(result));
    }catch (error) {
        console.log(error);
        const imageCard = document.querySelector(`#img-card-${index}`);
        imageCard.classList.replace("loading", "error");
        imageCard.querySelector(".status-text").textContent = "Failed to generate image Check console for details";
    }
   });
    
   await Promise.allSettled(imagePromises);
   generateBtn.removeAttribute("disabled");
 };



    const createImagesCard = (model, count, ratio, prompt) => {
        gridGallery.innerHTML = "";
        for(let i = 0; i < count; i++){
            gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio};">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                    </div>`;
       }
       generateImages(model, count, ratio, prompt);
    };


    const handleFromSubmit = (e)=>{
        e.preventDefault();
        const selectedModel = modelSelect.value;
        const imageSelect = parseInt(countSelect.value) || 1; // Integer value from dom readed by js in String remember Prompt function..
        const aspectRatio = ratioSelect.value || "1/1"; 
        const promptText = inputField.value.trim();

        createImagesCard(selectedModel, imageSelect, aspectRatio, promptText);
    }

    promptBtn.addEventListener("click",()=>{
        const randomIndex = Math.floor(Math.random() * examplePrompts.length);
        const prompt = examplePrompts[randomIndex];
        inputField.value = prompt;
        inputField.focus();
    });


    themeToggle.addEventListener("click",toggleTheme);
    promptForm.addEventListener("submit",handleFromSubmit);

});