// Read input from stdin
process.stdin.setEncoding('utf8');

let input = '';

process.stdin.on('data', function(chunk) {
  input += chunk;
});

process.stdin.on('end', function() {
  try {
    const parsedInput = JSON.parse(input);
    const x = parseFloat(parsedInput.x);
    const y = parseFloat(parsedInput.y);

    if (isNaN(x) || isNaN(y)) {
      throw new Error('Invalid input');
    }

    const result = {
      sum: x + y,
      product: x * y
    };

    console.log(JSON.stringify(result));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
});
