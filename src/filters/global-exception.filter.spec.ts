import { ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Response;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle HttpException and return its response', () => {
    const mockException = new HttpException(
      { message: 'Not Found', statusCode: 404 },
      404,
    );

    filter.catch(mockException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not Found',
      statusCode: 404,
    });
  });

  it('should handle unexpected exceptions as Internal Server Error', () => {
    const mockException = new Error('Unexpected Error');

    filter.catch(mockException, mockHost);

    expect(console.error).toHaveBeenCalledWith(
      'Unhandled exception:',
      mockException,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal Server Error',
    });
  });
});
