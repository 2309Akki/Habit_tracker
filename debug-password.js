import bcrypt from "bcryptjs";

async function testPassword() {
  const password = "testpassword123";
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const result = await bcrypt.compare(password, hash);
  console.log('Compare result:', result);
  
  const result2 = await bcrypt.compare("wrongpassword", hash);
  console.log('Wrong password compare result:', result2);
}

testPassword();
