let data = []; 
let powerBallData = [];

// Fetch regular ball data
// fetch('Powerball data - number-frequencies.csv')

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
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

// Helper function to get frequency info
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
        text: frequencyRow[1] ? `Drawn &nbsp;<strong>${frequencyRow[1]}</strong>&nbsp; times` : 'Frequency data unavailable',
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
                
                // Get existing results and update appropriately
                const resultDiv = document.querySelector('.result');
                const currentResults = resultDiv.innerHTML;
                
                if (isPowerball) {
                    // For powerball, replace any existing powerball info or add to end
                    const mainBallResults = currentResults.split('<hr>')[0] || currentResults.split('Powerball')[0] || currentResults;
                    resultDiv.innerHTML = mainBallResults + (mainBallResults ? '<hr>' : '') + frequencyInfo.text;
                } else {
                    // For main balls, replace main ball info but keep powerball info if it exists
                    const powerballMatch = currentResults.match(/(Powerball.*)/);
                    const powerballResults = powerballMatch ? '<hr>' + powerballMatch[1] : '';
                    resultDiv.innerHTML = frequencyInfo.text + powerballResults;
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