// Mock MCPTool from 'mcp-framework'
jest.mock('mcp-framework', () => ({
  MCPTool: class MockMCPTool {
    constructor() {}
  }
}), { virtual: true });

import FatZebraCreateCustomerTool from '../FatZebraCreateCustomerTool.js';
import fetch from 'node-fetch';
import { jest } from '@jest/globals';

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('FatZebraCreateCustomerTool', () => {
  let tool: FatZebraCreateCustomerTool;
  
  beforeEach(() => {
    tool = new FatZebraCreateCustomerTool();
    // Reset environment variables
    process.env.FAT_ZEBRA_API_URL = 'https://test-gateway.example.com/v1.0';
    process.env.FAT_ZEBRA_USERNAME = 'testuser';
    process.env.FAT_ZEBRA_TOKEN = 'testtoken';
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.FAT_ZEBRA_API_URL;
    delete process.env.FAT_ZEBRA_USERNAME;
    delete process.env.FAT_ZEBRA_TOKEN;
  });

  const mockInput = {
    first_name: "Harrold",
    last_name: "Humphries",
    reference: "jsoie33789",
    email_address: "hhump@gmail.com",
    ip_address: "180.200.33.181",
    card: {
      card_holder: "Harrold Humphries Senior",
      card_number: "5123456789012346",
      expiry_date: "05/2023",
      cvv: "123"
    },
    address: {
      address: "1 Harriet Road",
      city: "Kooliablin",
      state: "NSW",
      postcode: "2222",
      country: "Australia"
    }
  };

  it('should create a customer successfully', async () => {
    // Arrange
    const mockResponse = {
      successful: true,
      response: {
        id: 'customer-123',
        first_name: 'Harrold',
        last_name: 'Humphries',
        reference: 'jsoie33789',
        email_address: 'hhump@gmail.com',
        created_at: '2023-01-01T00:00:00Z',
        token: 'cus_token_123'
      }
    };
    
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeTruthy();
    expect(result.response).toEqual(mockResponse.response);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    
    // Verify proper JSON structure is being sent to the API
    const requestBody = JSON.parse(
      (mockedFetch.mock.calls[0][1] as any).body
    );
    
    expect(requestBody).toHaveProperty('card');
    expect(requestBody.card).toHaveProperty('card_holder');
    expect(requestBody.card).toHaveProperty('card_number');
    expect(requestBody.card).toHaveProperty('expiry_date');
    expect(requestBody.card).toHaveProperty('cvv');
    
    expect(requestBody).toHaveProperty('address');
    expect(requestBody.address).toHaveProperty('address');
    expect(requestBody.address).toHaveProperty('city');
    expect(requestBody.address).toHaveProperty('state');
    expect(requestBody.address).toHaveProperty('postcode');
    expect(requestBody.address).toHaveProperty('country');
    
    expect(requestBody).toHaveProperty('email_address');
    expect(requestBody).not.toHaveProperty('email');
    
    // Test with expect.objectContaining instead of exact match to handle property order differences
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://gateway.sandbox.fatzebra.com.au/v1.0/customers',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from('TEST:TEST').toString('base64')}`,
        })
      })
    );
  });

  it('should transform flat card fields into nested card object', async () => {
    // Arrange
    const flatInput = {
      first_name: "John",
      last_name: "Doe",
      reference: "CUST-12345",
      email: "john.doe@example.com",
      card_number: "4111111111111111",
      card_expiry: "05/2026",
      card_holder: "John Doe",
      cvv: "123",
      address: {
        street1: "123 Main St",
        city: "Anytown",
        state: "VIC",
        postal_code: "3000",
        country: "AU"
      }
    };

    const mockResponse = {
      successful: true,
      response: {
        id: 'customer-123'
      }
    };
    
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(flatInput as any);

    // Assert
    expect(result.successful).toBeTruthy();
    
    // Verify the transformation was applied correctly
    const requestBody = JSON.parse(
      (mockedFetch.mock.calls[0][1] as any).body
    );
    
    // Email field transformation
    expect(requestBody).toHaveProperty('email_address', 'john.doe@example.com');
    expect(requestBody).not.toHaveProperty('email');
    
    // Card fields should be nested
    expect(requestBody).toHaveProperty('card');
    expect(requestBody.card).toHaveProperty('card_holder', 'John Doe');
    expect(requestBody.card).toHaveProperty('card_number', '4111111111111111');
    expect(requestBody.card).toHaveProperty('expiry_date', '05/2026');
    expect(requestBody.card).toHaveProperty('cvv', '123');
    
    // Flat card fields should not be present at top level
    expect(requestBody).not.toHaveProperty('card_holder');
    expect(requestBody).not.toHaveProperty('card_number');
    expect(requestBody).not.toHaveProperty('card_expiry');
    expect(requestBody).not.toHaveProperty('cvv');
    
    // Address field transformation
    expect(requestBody.address).toHaveProperty('address', '123 Main St');
    expect(requestBody.address).not.toHaveProperty('street1');
    expect(requestBody.address).toHaveProperty('postcode', '3000');
    expect(requestBody.address).not.toHaveProperty('postal_code');
  });

  it('should return validation errors for missing required fields', async () => {
    // Arrange
    const incompleteInput = {
      first_name: "John",
      last_name: "Doe",
      reference: "CUST-12345",
      // Missing email/email_address
      // Missing card information
      address: {
        city: "Anytown",
        state: "VIC",
        country: "AU"
        // Missing address/street1/line1
        // Missing postcode/postal_code
      }
    };

    // Act
    const result = await tool.execute(incompleteInput as any);

    // Assert
    expect(result.successful).toBeFalsy();
    expect(result.errors).toContain("Missing customer email address. Please provide either 'email_address' or 'email'.");
    expect(result.errors).toContain("Missing card information. Please provide card details.");
    expect(result.errors).toContain("Missing street address. Please provide either 'address', 'street1', or 'line1'.");
    expect(result.errors).toContain("Missing postcode in address information. Please provide either 'postcode' or 'postal_code'.");
    
    // Fetch shouldn't be called if validation fails
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('should handle API errors properly', async () => {
    // Arrange
    const mockResponse = {
      successful: false,
      errors: ['Invalid card number']
    };
    
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeFalsy();
    expect(result.errors).toEqual(['Invalid card number']);
  });

  it('should handle non-JSON responses', async () => {
    // Arrange
    const mockFetchResponse = {
      text: () => Promise.resolve('Internal Server Error'),
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'text/plain';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeFalsy();
    expect(result.errors).toEqual(['Internal Server Error']);
  });

  it('should handle network errors', async () => {
    // Arrange
    mockedFetch.mockRejectedValue(new Error('Network error'));

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeFalsy();
    expect(result.errors).toEqual(['Network error']);
  });

  it('should use default API URL, username and token if environment variables are not set', async () => {
    // Arrange
    delete process.env.FAT_ZEBRA_API_URL;
    delete process.env.FAT_ZEBRA_USERNAME;
    delete process.env.FAT_ZEBRA_TOKEN;
    
    const mockResponse = { successful: true, response: { id: 'customer-123' } };
    const mockJsonPromise = Promise.resolve(mockResponse);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    await tool.execute(mockInput);

    // Assert
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://gateway.sandbox.fatzebra.com.au/v1.0/customers',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Basic ${Buffer.from('TEST:TEST').toString('base64')}`,
        }),
      })
    );
  });

  it('should handle HTTP 201 Created response as successful', async () => {
    // Arrange
    const responseData = {
      id: 'customer-123',
      first_name: 'John',
      last_name: 'Doe',
      reference: 'CUST-12345',
      email_address: 'john.doe@example.com',
      created_at: '2023-01-01T00:00:00Z'
    };
    
    const mockJsonPromise = Promise.resolve(responseData);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      status: 201,
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeTruthy();
    expect(result.response).toEqual(responseData);
  });

  it('should handle HTTP 201 Created with successful: false as successful', async () => {
    // Arrange
    const responseData = {
      successful: false,  // API incorrectly says false even though status is 201
      response: {
        id: 'customer-123',
        first_name: 'John',
        last_name: 'Doe'
      }
    };
    
    const mockJsonPromise = Promise.resolve(responseData);
    const mockFetchResponse = {
      json: () => mockJsonPromise,
      status: 201,  // But status code is 201 Created
      headers: {
        get: jest.fn().mockImplementation(key => {
          if (key === 'content-type') return 'application/json';
          return null;
        })
      }
    };
    mockedFetch.mockResolvedValue(mockFetchResponse as any);

    // Act
    const result = await tool.execute(mockInput);

    // Assert
    expect(result.successful).toBeTruthy();
    expect(result.response).toEqual(responseData.response);
  });
}); 