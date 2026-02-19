# Prime Difference Grid

This project visualizes prime numbers and their differences in a variable-sized grid. The grid displays the differences between consecutive prime numbers, with each cell colored according to its value.

## Features

- Variable-sized grid that can be adjusted
- Color-coded visualization of prime differences
- Interactive controls for customizing the display
- Responsive design that works on different screen sizes

## How It Works

The application uses the following mathematical concepts:
1. Generates a sequence of prime numbers using a prime number generator
2. Calculates the differences between consecutive primes (t(n+1) - t(n))
3. Displays these differences in a grid format with color coding
4. Allows customization of colors through a palette

## Usage

1. Adjust the grid size using the input field
2. Click "Update Grid" to regenerate the display
3. Select a color from the palette to change all cell colors
4. The grid will show prime differences, and lists will show the actual primes and their differences

## Mathematical Foundation

- t(n) = [primes(n - 1) - primes(n) ... primes(|primes| - 1) - primes(|primes|)] 
- Where primes(n) is a predefined term generator function that returns n count of primes
- The difference function calculates the gaps between consecutive prime numbers

## Implementation Details

The application uses:
- Pure JavaScript for calculations and DOM manipulation
- CSS Grid for responsive layout
- HTML5 for structure and semantic elements
- Color-coded visualization with customizable palette