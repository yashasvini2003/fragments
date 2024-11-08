const {
  isConversionPossible,
  hasExtension,
  separateIdExtensionAndMediaType,
  convertMarkdownToHTML,
  convertToPlainText,
  convertJSONToText,
  validateContentType,
  convertFragment,
} = require('../../src/model/data/utils');

const markdownIt = require('markdown-it')();
describe('isConversionPossible', () => {
  test('should return true for valid conversion', () => {
    const originalType = 'text/plain';
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should return false for invalid conversion', () => {
    const originalType = 'text/plain';
    const requestedType = 'pdf';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should be case-insensitive for original type', () => {
    const originalType = 'Text/Plain';
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should be case-insensitive for requested type', () => {
    const originalType = 'text/plain';
    const requestedType = 'TXT';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should handle unknown original type', () => {
    const originalType = 'application/xml';
    const requestedType = 'json';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle null original type', () => {
    const originalType = null;
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle undefined original type', () => {
    const originalType = undefined;
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle null requested type', () => {
    const originalType = 'text/plain';
    const requestedType = null;
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle undefined requested type', () => {
    const originalType = 'text/plain';
    const requestedType = undefined;
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle valid conversion with multiple valid extensions', () => {
    const originalType = 'text/markdown';
    const requestedType = 'html';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should handle invalid conversion with multiple valid extensions', () => {
    const originalType = 'text/markdown';
    const requestedType = 'pdf';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle invalid conversion with long original type and requested type', () => {
    const originalType = 'application/json' + 'a'.repeat(255);
    const requestedType = 'pdf' + 'a'.repeat(255);
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });
});

describe('separateIdExtensionAndMediaType', () => {
  it('should separate ID, extension, and media type when extension is present', () => {
    const supportedMediaTypes = {
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      json: 'application/json',
    };

    for (const extension in supportedMediaTypes) {
      const idWithExtension = `4dcc65b6-9d57-453a-bd3a-63c107a51698.${extension}`;
      const expectedMediaType = supportedMediaTypes[extension];

      const result = separateIdExtensionAndMediaType(idWithExtension);

      expect(result.id).toBe('4dcc65b6-9d57-453a-bd3a-63c107a51698');
      expect(result.extension).toBe(extension);
      expect(result.mediaType).toBe(expectedMediaType);
    }
  });

  it('should consider entire input as ID when no extension is present', () => {
    const idWithExtension = '4dcc65b6-9d57-453a-bd3a-63c107a51698';
    const result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('4dcc65b6-9d57-453a-bd3a-63c107a51698');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');
  });

  it('should handle null or undefined input', () => {
    let idWithExtension = null;
    let result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('null');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');

    idWithExtension = undefined;
    result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('undefined');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');
  });
});

describe('hasExtension', () => {
  test('should return false for empty string', () => {
    const id = '';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false when no extension is present', () => {
    const id = '4dcc65b6-9d57-453a-bd3a-63c107a51698';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true when extension is present', () => {
    const id = '4dcc65b6-9d57-453a-bd3a-63c107a51698.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for null value', () => {
    const id = null;
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for undefined value', () => {
    const id = undefined;
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for long identifier without extension', () => {
    const id = 'a'.repeat(255);
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for long identifier with extension', () => {
    const id = 'a'.repeat(255) + '.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for identical identifier without extension', () => {
    const id = 'abcde';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for identical identifier with extension', () => {
    const id = 'abcde.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for identifier with the value "null"', () => {
    const id = 'null';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for identifier with the value "0"', () => {
    const id = '0';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for identifier with special characters', () => {
    const id = '!@#$%^&*()-_=+.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });
});

describe('convertMarkdownToHTML', () => {
  test('should convert a valid Markdown fragment to HTML', async () => {
    const markdown = '## Heading\n\nSome **bold** and _italic_ text.';
    const expectedHTML =
      '<h2>Heading</h2>\n<p>Some <strong>bold</strong> and <em>italic</em> text.</p>\n';
    expect(await convertMarkdownToHTML(markdown)).toBe(expectedHTML);
  });

  test('should convert a Markdown buffer to HTML', async () => {
    const markdownBuffer = Buffer.from('## Heading\n\nSome **bold** text.');
    const expectedHTML = '<h2>Heading</h2>\n<p>Some <strong>bold</strong> text.</p>\n';
    expect(await convertMarkdownToHTML(markdownBuffer)).toBe(expectedHTML);
  });

  test('should convert an empty Markdown buffer to HTML', async () => {
    const markdownBuffer = Buffer.from('');
    const expectedHTML = '';
    expect(await convertMarkdownToHTML(markdownBuffer)).toBe(expectedHTML);
  });

  test('should handle empty Markdown input', async () => {
    expect(await convertMarkdownToHTML('')).toBe('');
  });

  test('should handle null input gracefully', async () => {
    expect(await convertMarkdownToHTML(null)).toBe('');
  });

  test('should handle zero input gracefully', async () => {
    expect(await convertMarkdownToHTML(0)).toBe('');
  });
});

describe('convertToPlainText', () => {
  test('should convert HTML fragment to plain text', async () => {
    const htmlFragment =
      '<h2>Heading</h2><p>Some <strong>bold</strong> and <em>italic</em> text.</p>';
    const expectedPlainText = 'HeadingSome bold and italic text.';
    expect(await convertToPlainText(htmlFragment, 'text/html')).toBe(expectedPlainText);
  });

  test('should convert Markdown fragment to plain text', async () => {
    const markdownFragment = '## Heading\n\nSome **bold** and _italic_ text.';
    const expectedPlainText = await markdownIt.render(markdownFragment).replace(/<[^>]+>/g, '');
    expect(await convertToPlainText(markdownFragment, 'text/markdown')).toBe(expectedPlainText);
  });

  test('should handle empty input', async () => {
    expect(await convertToPlainText('', 'text/html')).toBe('');
  });

  test('should handle unknown fromType', async () => {
    const fragment = 'Some text';
    const unknownType = 'text/plain';
    expect(await convertToPlainText(fragment, unknownType)).toBe('');
  });

  test('should handle null input', async () => {
    expect(await convertToPlainText(null, 'text/html')).toBe('');
  });

  test('should handle buffer input', async () => {
    const bufferFragment = Buffer.from('<p>Buffer content</p>');
    const expectedPlainText = 'Buffer content';
    expect(await convertToPlainText(bufferFragment, 'text/html')).toBe(expectedPlainText);
  });
});

describe('convertJSONToText', () => {
  test('should convert JSON to formatted plain text', () => {
    const jsonData = { name: 'John Doe', age: 30 };
    const expectedPlainText = '{\n  "name": "John Doe",\n  "age": 30\n}';
    expect(convertJSONToText(JSON.stringify(jsonData))).toBe(expectedPlainText);
  });

  test('should handle empty JSON input', () => {
    expect(convertJSONToText('{}')).toBe('{}');
  });

  test('should handle invalid JSON input', () => {
    const invalidJson = '{"name": "John Doe", "age: 30}';
    expect(() => convertJSONToText(invalidJson)).toThrow('Failed to convert JSON to plain text');
  });

  test('should handle buffer input', () => {
    const bufferData = Buffer.from('{"name": "John Doe", "age": 30}');
    const expectedPlainText = '{\n  "name": "John Doe",\n  "age": 30\n}';
    expect(convertJSONToText(bufferData)).toBe(expectedPlainText);
  });
});

describe('validateContentType', () => {
  test('should throw an error for unsupported content type', async () => {
    const reqBody = Buffer.from('sample data');
    const contentTypeHeader = 'application/xml';

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrow(
      'Unsupported content type'
    );
  });

  test('should successfully validate JSON content type', async () => {
    const reqBody = Buffer.from('{"key": "value"}');
    const contentTypeHeader = 'application/json';

    await expect(validateContentType(reqBody, contentTypeHeader)).resolves.toBeUndefined();
  });

  test('should throw an error when parsing invalid JSON', async () => {
    const reqBody = Buffer.from('invalid json');
    const contentTypeHeader = 'application/json';

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrow();
  });

  test('should successfully validate image content type', async () => {
    const reqBody = Buffer.from('sample image buffer');
    const contentTypeHeader = 'image/png';

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrowError(
      'Invalid image format.'
    );
  });

  test('should throw an error when metadata extraction fails for image', async () => {
    const reqBody = Buffer.from('invalid image buffer');
    const contentTypeHeader = 'image/jpeg';

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrow();
  });

  test('should successfully validate text content types', async () => {
    const reqBody = Buffer.from('sample text data');
    const textContentTypes = ['text/html', 'text/plain', 'text/markdown'];
    for (const contentTypeHeader of textContentTypes) {
      await expect(validateContentType(reqBody, contentTypeHeader)).resolves.toBeUndefined();
    }
  });

  test('should handle null and zero values for request body and content type', async () => {
    const reqBody = Buffer.from('');
    await expect(validateContentType(reqBody, 'text/plain')).resolves.toBeUndefined();
  });

  test('should throw an error if request body is not a Buffer', async () => {
    const reqBody = 'invalidRequest';
    const contentTypeHeader = 'application/json';

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrow(Error);
  });

  test('should throw an error if content type header is not a string', async () => {
    const reqBody = Buffer.from('validRequestBody');
    const contentTypeHeader = 12345;

    await expect(validateContentType(reqBody, contentTypeHeader)).rejects.toThrow(Error);
  });

  test('should not throw any error if request body is a Buffer and content type header is a string', async () => {
    const reqBody = Buffer.from('validRequestBody');
    const contentTypeHeader = 'text/plain';

    await expect(validateContentType(reqBody, contentTypeHeader)).resolves.toBeUndefined();
  });
});

describe('convertFragment - Othr tests are in GET', () => {
  test('throws an error for unsupported conversion', async () => {
    const rawBinaryData = Buffer.from('your data'); // Provide raw binary data as needed
    const fromType = 'text/plain'; // Provide an unsupported "fromType"
    const toExt = 'pdf'; // Provide an unsupported "toExt"
    const toType = 'application/pdf'; // Provide an unsupported "toType"

    await expect(async () => {
      await convertFragment(rawBinaryData, fromType, toExt, toType);
    }).rejects.toThrow('Unsupported conversion');
  });
});
