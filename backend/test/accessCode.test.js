const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');

test('bcrypt hash never reveals plaintext and only matches the original code', async () => {
  const hash = await bcrypt.hash('super_secret_code', 10);
  assert.notStrictEqual(hash, 'super_secret_code');
  assert.ok(await bcrypt.compare('super_secret_code', hash));
  assert.ok(!(await bcrypt.compare('wrong_code', hash)));
});
