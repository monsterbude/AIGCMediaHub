// Test script for ComfyUI JSON parsing fix
// This script tests the parseComfyUI function's ability to handle 'disable' values

// Create a simple test by directly testing the type checking logic
function testTypeChecks() {
  console.log('Testing type checking logic...');
  
  // Test cases for seed value checking
  const testValues = ['disable', 123456789, '123456789', null, undefined, ''];
  
  testValues.forEach(value => {
    const isValid = typeof value === 'number' || !isNaN(value);
    console.log(`Value: ${value} (type: ${typeof value}) -> Valid: ${isValid}`);
    
    if (isValid) {
      try {
        const bigIntValue = BigInt(value);
        console.log(`  ✓ Successfully converted to BigInt: ${bigIntValue}`);
      } catch (error) {
        console.log(`  ✗ Failed to convert to BigInt: ${error.message}`);
      }
    }
  });
  
  console.log('\nTest completed!');
}

testTypeChecks();
