console.log('content.js is running on this domain');

class BadUnit {
  constructor(unitName, imperial, metric) {
    this.unitName = unitName;
    this.imperial = imperial;
    this.metric = metric;
  }
  replacementString() {
    return '(1 ' + this.unitName + ' = ' + this.imperial /*+ ' or ' + this.metric*/ + ')'; 
  }
};

function setupDistanceUnits() {
  const distanceUnits = [
    new BadUnit('banana', '6 inches', '23 centimeters'),
    new BadUnit('giraffe', '15 feet', '5 meters'),
    new BadUnit('blue whale', '90 feet', '26 meters'),
    new BadUnit('basketball court', '94 feet', '29 meters'),
    new BadUnit('Boeing 737 airplane', '129 feet', '40 meters')
  ];
  return distanceUnits;
}

function setupWeightUnits() {
  const weightUnits = [
    new BadUnit('male turkey', '41 lb', '19 kilograms'),
    new BadUnit('average first grader', '50 pounds', '25 kilograms'),
    new BadUnit('Ford 150 Lightning', '6,000 pounds', '2,720 kilograms'),
    new BadUnit('standard size goldendoodle', '50 pounds', '23 kilograms'),
    new BadUnit('mouse', '0.5 ounce', '14 grams')
  ];
  return weightUnits;
}

function setupLiquidVolumeUnits() {
  const volumeUnits = [
    new BadUnit('Olympic swimming pool', '660,430 gallons', '2,500 cubic meters'),
    new BadUnit('low-flow toilet tank', '1.28 gallons', '4.85 liters'),
    new BadUnit('Venti starbucks cup', '20 ounces', '591 milliliters'),
    new BadUnit('shot of gin', '1.5 fluid ounces', '44 milliliters'),
    new BadUnit('Medium Dairy Queen Blizzard', '16 ounces', '743 milliliters')
  ];
  return volumeUnits;
}

function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function constructPromptNonRecipe(inputText) {
  const distanceUnit = getRandomElement(setupDistanceUnits());
  const weightUnit = getRandomElement(setupWeightUnits());
  const volumeUnit = getRandomElement(setupLiquidVolumeUnits());

/*  const promptText = 'The following text may contain units of measure for distances, volumes, or weight. ' +
    'Delete the existing units of measure and substitute them in place with their equivalents in terms of: ' +
    distanceUnit.unitName + ' for distance ' + distanceUnit.replacementString() + ', ' +
    weightUnit.unitName + ' for weight ' + weightUnit.replacementString() + ', and ' +
    volumeUnit.unitName + ' for volume or liquid measure ' + volumeUnit.replacementString() + '. ' +
    'Do not include any additional commentary. ' +
    'Only use the units of measure that I provided: ' + distanceUnit.unitName + ', ' + weightUnit.unitName + ', ' + volumeUnit.unitName + '. ' +
    'Completely replace the standard units with these equivalents. ' +
    'Remove all references to miles, feet, inches, kilometers, centimeters, pounds, kilograms, and other standard units of measure. ' +
    'Do not include any other units besides: ' + distanceUnit.unitName + ', ' + weightUnit.unitName + ', ' + volumeUnit.unitName + '. ' +
    'I want to see the recipe written solely and only with these fun units. ' +
    'When replacing the old units with the new units, do a math problem. Convert the number in old units to the number in new units. ' +
    'To do the conversion, divide or multiply the original units per the provided conversion. ' +
    'The text for you to rewrite is as follows: "' + inputText + '"';*/

  const promptText =
      'I am going to provide you text that might contain units of measure for distances, volumes, or weight. ' +
      'Look at that text. Every time you encounter a unit of measure for distance (such as inch, mile, kilometer, or centimeter), ' +
      'perform the following steps: [START LIST]' +
      '1) Do a math problem in your head to convert from the original unit of distance to distance in terms of 1 blue whale. ' +
      'Use the following conversion factor: 1 blue whale = 90 feet. ' +
      '2) Delete the original unit of measure. ' +
      '3) Replace it with the new one that you just calculated. [END LIST] ' +
      'Every time you encounter a unit of measure for weight (such as pounds, stones, or kilograms), perform the following steps: [START LIST] ' +
      '1) Do a math problem in your head to convert from the original unit of weight to weight in terms of a standard size goldendoodle. ' +
      'Use the following conversion factor: 1 standard size goldendoodle = 50 lb. ' +
      '2) Delete the original unit of measure. ' +
      '3) Replace it with the new one that you just calculated. [END LIST] ' +
      'Do not include any additional commentary. ' +
      'Leave the text unchanged except for replacing the units of measure. Only use the new units of measure that I provided. ' +
      'Remove all references to miles, feet, inches, kilometers, centimeters, pounds, kilograms, and other standard units of measure. ' +
      'I want to see the text written solely and only with these fun units. ' +
      'Examples include: ' +
      'Input: Roger weighs 200lb. Output: Roger weighs 4 standard goldendoodles. ' +
      'Input: The yacht is 30 ft long. Output: The yacht is 0.333 blue whales long. ' +
      'Input: Antonio is 10\'3\" tall. Output: Antonio is 0.1138888 blue whales tall. ' +
      'Input: Buckaroo weighs 25lb. Output: Buckaroo weighs 0.5 standard size goldendoodle. ' +
      'The text for you to rewrite is as follows: ' + inputText;
  return promptText;
}

async function callModelAndPrintToConsole(session, promptString) {
  console.log(promptString);
  const result = await session.prompt(promptString);
  console.log(result);
  return result;
}

async function runOnPage() {
  const available = (await ai.languageModel.capabilities()).available;
  if (available === 'no') {
    console.log('Unable to load the AI origin trial');
    return;
  }
  if (available === 'readily') {
    console.log('Ready immediately');
  } else {
    console.log('Need to download');
  }
  const session = await ai.languageModel.create(/*{
    temperature: 2,
    topK: 5
  }*/);

  const testText = 'Adriana is 5 feet tall. Mark is 5\'10\" tall. He weighs 185lb.';
  const promptString = constructPromptNonRecipe(testText); 

  const minimumRepro = 'Consider the following paragraph: \"A table is 30\" long.\" We know that 1 banana = 6 inches long. How many bananas long is the table? Take your answer and rewrite the original sentence in terms of bananas instead of inches. Only output the rewritten sentence; don\'t include your explanation or calculation.';
  const result = await callModelAndPrintToConsole(session, minimumRepro);
  session.destroy();
}

if (document.domain == 'example.com')
  runOnPage();