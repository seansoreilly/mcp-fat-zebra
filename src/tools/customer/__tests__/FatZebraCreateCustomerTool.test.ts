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
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://gateway.sandbox.fatzebra.com.au/v1.0/customers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from('TEST:TEST').toString('base64')}`,
        },
        body: JSON.stringify(mockInput),
      }
    );
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
}); 