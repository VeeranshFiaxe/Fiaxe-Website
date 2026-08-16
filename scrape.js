// Use global fetch
async function run() {
  const res = await fetch('https://logo.clearbit.com/hyundai.com');
  console.log('Clearbit status:', res.status);
  console.log('Content-Type:', res.headers.get('content-type'));
}
run();
run();
