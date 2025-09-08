let data = []; 
let powerBallData = [];
let dataLoaded = false;
let powerBallLoaded = false;

// Function to get the latest date from the data
function getLatestDate(dataSource) {
    if (dataSource.length === 0) return null;
    
    // Get all dates from column [2] and find the latest one
    const dates = dataSource
        .map(row => {
            if (row[2]) {
                const dateStr = row[2].trim();
                // Split the date string manually to avoid timezone issues
                const [year, month, day] = dateStr.split('-');
                return {
                    dateStr: dateStr,
                    year: parseInt(year),
                    month: parseInt(month),
                    day: parseInt(day),
                    // Create a comparison value for sorting
                    compareValue: parseInt(year) * 10000 + parseInt(month) * 100 + parseInt(day)
                };
            }
            return null;
        })
        .filter(dateObj => dateObj !== null) // Filter out null dates
        .sort((a, b) => b.compareValue - a.compareValue); // Sort descending (latest first)
    
    return dates.length > 0 ? dates[0] : null;
}

// Function to format date as "Month Day, Year" without using Date object
function formatDate(dateObj) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = months[dateObj.month - 1]; // month is 1-indexed in the data
    return `${monthName} ${dateObj.day}, ${dateObj.year}`;
}

// Function to update the footnote with the latest date
function updateFootnoteDate() {
    // Get latest date from both datasets
    const latestMainDate = getLatestDate(data);
    const latestPowerballDate = getLatestDate(powerBallData);
    
    console.log('Latest main ball date:', latestMainDate);
    console.log('Latest powerball date:', latestPowerballDate);
    
    // Find the overall latest date
    let latestDate = null;
    if (latestMainDate && latestPowerballDate) {
        latestDate = latestMainDate.compareValue > latestPowerballDate.compareValue ? latestMainDate : latestPowerballDate;
    } else if (latestMainDate) {
        latestDate = latestMainDate;
    } else if (latestPowerballDate) {
        latestDate = latestPowerballDate;
    }
    
    // Update the footnote
    const footnote = document.querySelector('.footnote p');
    if (footnote && latestDate) {
        const formattedDate = formatDate(latestDate);
        footnote.innerHTML = `Interactive: Katrina Ventura/Hearst TV • Source: <a href="https://www.powerball.net/statistics" target="_blank">Powerball Statistics</a><br><i>Data as of ${formattedDate}.</i>`;
        console.log(`Updated footnote with date: ${formattedDate} (from ${latestDate.dateStr})`);
    } else if (footnote) {
        console.log('Could not determine latest date from data');
    } else {
        console.log('Footnote element not found');
    }
}
// Function to assign balls after data is loaded
function assignBallsToFrequency() {
    if (!dataLoaded || !powerBallLoaded) {
        console.log('Waiting for data to load...');
        return;
    }
    
    const mainIds = ['main1', 'main2', 'main3', 'main4', 'main5', 'main65', 'main66','main67', 'main68', 'main69'];
    const powerballIds = ['powerball1', 'powerball2', 'powerball3', 'powerball4', 'powerball5', 'powerball22', 'powerball23', 'powerball24', 'powerball25', 'powerball26'];

    // Update the footnote date first
    updateFootnoteDate();


    // Assign main balls
    if (data.length > 0) {
        const sortedData = [...data].sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        
        console.log('--- Main Ball Assignment Debug ---');
        console.log('Original main ball data:', data);
        console.log('Sorted main ball data (by frequency):', sortedData);
        console.log('');
        
        mainIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element && sortedData[index]) {
                const ballNumber = sortedData[index][0];
                const frequency = sortedData[index][1];
                
                element.textContent = ballNumber;
                
                console.log(`${id} -> Ball: ${ballNumber}, Frequency: ${frequency}`);
            } else if (element && !sortedData[index]) {
                console.log(`${id} -> No data available (index ${index})`);
            } else {
                console.log(`${id} -> Element not found in DOM`);
            }
        });
        
        console.log('--- End Main Ball Assignment Debug ---');
    } else {
        console.log('No main ball data available to assign to balls');
    }

    // Assign powerballs
    if (powerBallData.length > 0) {
        const sortedPowerballData = [...powerBallData].sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        
        console.log('--- Powerball Assignment Debug ---');
        console.log('Original powerball data:', powerBallData);
        console.log('Sorted powerball data (by frequency):', sortedPowerballData);
        console.log('');
        
        powerballIds.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element && sortedPowerballData[index]) {
                const ballNumber = sortedPowerballData[index][0];
                const frequency = sortedPowerballData[index][1];
                
                element.textContent = ballNumber;
                
                console.log(`${id} -> Powerball: ${ballNumber}, Frequency: ${frequency}`);
            } else if (element && !sortedPowerballData[index]) {
                console.log(`${id} -> No powerball data available (index ${index})`);
            } else {
                console.log(`${id} -> Element not found in DOM`);
            }
        });
        
        console.log('--- End Powerball Assignment Debug ---');
    } else {
        console.log('No powerball data available to assign to powerballs');
    }
}

// Fetch main ball data
fetch('https://raw.githubusercontent.com/kv-hearst/powerball/main/data/main_ball_cleaned.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(csvData => {
        const rows = csvData.split('\n').slice(1); 
        data = rows.map(row => row.split(','));
        console.log('Regular Ball Data:', data);
        dataLoaded = true;
        assignBallsToFrequency(); // Try to assign after this data loads
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

// Fetch powerball data
fetch('https://raw.githubusercontent.com/kv-hearst/powerball/main/data/powerball_cleaned.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(csvData => {
        const rows = csvData.split('\n').slice(1); 
        powerBallData = rows.map(row => row.split(','));
        console.log('Power Ball Data:', powerBallData);
        powerBallLoaded = true;
        assignBallsToFrequency(); // Try to assign after this data loads
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function getFrequencyInfo(selectedNumber, dataSource, ballType = 'Ball') {
        const frequencyRow = dataSource.find(row => row[0] == selectedNumber);
        
        if (!frequencyRow) {
            return { text: 'Frequency: N/A', found: false };
        }
        
        const rankedData = dataSource
            .map(row => ({
                number: row[0],
                frequency: parseInt(row[1]),
                rank: 0
            }))
            .sort((a, b) => b.frequency - a.frequency);
        
        rankedData.forEach((row, index) => {
            row.rank = index + 1;
        });
        
        const selectedRank = rankedData.find(row => row.number == selectedNumber)?.rank;
    
    
        return {
            text: frequencyRow[1] ? `Drawn&nbsp;<strong>${frequencyRow[1]}</strong>&nbsp;times` : 'Frequency data unavailable',
            found: true
        };
    }
    
    // Single event listener for all balls
    document.querySelectorAll('.ball').forEach(ball => {
        const isPowerball = ball.id === 'powerball';
        const maxNumber = isPowerball ? 26 : 69;
        const ballType = isPowerball ? 'Powerball' : 'Ball';
        
        // Click event for dropdown
        ball.addEventListener('click', function () {
            const ballNumber = this.querySelector('.ball-number');
            
            // Check if dropdown already exists
            if (!this.querySelector('select')) {
                const dropdown = document.createElement('select');
                const options = Array.from({ length: maxNumber }, (_, i) => i + 1);
                
                // Get current ball number to set as selected
                const currentNumber = ballNumber.textContent;
                
                options.forEach(optionText => {
                    const option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText;
                    
                    // Set the current ball number as selected
                    if (optionText.toString() === currentNumber) {
                        option.selected = true;
                    }
                    
                    dropdown.appendChild(option);
                });
                
                // Hide the ball number text and replace with dropdown
                ballNumber.style.display = 'none';
                
                // Single change event listener
                dropdown.addEventListener('change', function () {
                    const selectedNumber = this.value;
                    ballNumber.textContent = selectedNumber;
                    
                    // Get current data when event fires
                    const currentData = isPowerball ? powerBallData : data;
                    
                    // Update result using helper function
                    const frequencyInfo = getFrequencyInfo(selectedNumber, currentData, ballType);
    
                    const resultMain = document.getElementById('result-main');
                    const resultPowerball = document.getElementById('result-powerball');
                    const mainBallResults = resultMain ? resultMain.innerHTML : '';
                    const powerballResults = resultPowerball ? resultPowerball.innerHTML : '';
           
                    if (isPowerball) {
                        // For powerball, replace any existing powerball info or add to end
                        resultPowerball.innerHTML = frequencyInfo.text;
                    } else {
                        // For main balls, update only the main ball results section
                        resultMain.innerHTML = frequencyInfo.text;
                    }
    
                   
                });
                
                // Add blur event to hide dropdown and show number again
                dropdown.addEventListener('blur', function () {
                    ballNumber.style.display = 'flex';
                    this.remove();
                });
                
                // Position the dropdown where the ball number was
                dropdown.style.position = 'absolute';
                dropdown.style.top = '50%';
                dropdown.style.left = '50%';
                dropdown.style.transform = 'translate(-50%, -50%)';
                dropdown.style.background = 'transparent';
                dropdown.style.border = 'none';
                // dropdown.style.fontSize = 'inherit';
                dropdown.style.textAlign = 'center';
                
                ballNumber.parentNode.appendChild(dropdown);
                
                // Focus the dropdown to open it
                dropdown.focus();
            }
        });
    });
    