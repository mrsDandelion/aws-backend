import { SNS } from "aws-sdk";
import { main as catalogBatchProcess } from "./handler";
import { createProductData, createStockData } from '../../libs/db';

jest.mock('aws-sdk');
jest.mock('../../libs/db');

describe('catalogBatchProcess', () => {
    const mockPublish = jest.fn();
  
    beforeEach(() => {
      (SNS as unknown as jest.Mock).mockImplementation(() => ({
        publish: mockPublish.mockImplementation(() => ({
          promise: jest.fn(),
        })),
      }));
  
      (createProductData as jest.Mock).mockResolvedValue(true);
      (createStockData as jest.Mock).mockResolvedValue(true);
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should call createProductData and createStockData for each record', async () => {
      const event = {
        Records: [
          { body: JSON.stringify({ title: 'Product1', price: 10, count: 5 }) },
          { body: JSON.stringify({ title: 'Product2', price: 20, count: 8 }) },
        ],
      };
  
      await catalogBatchProcess(event);
  
      expect(createProductData).toHaveBeenCalledTimes(2);
      expect(createStockData).toHaveBeenCalledTimes(2);
    });
  
    it('should not call createProductData and createStockData for records without title', async () => {
      const event = {
        Records: [
          { body: JSON.stringify({ price: 10, count: 5 }) },
          { body: JSON.stringify({ title: 'Product2', price: 20, count: 8 }) },
        ],
      };
  
      await catalogBatchProcess(event);
  
      expect(createProductData).toHaveBeenCalledTimes(1);
      expect(createStockData).toHaveBeenCalledTimes(1);
    });
  
    it('should call SNS.publish with correct parameters', async () => {
      const event = {
        Records: [
          { body: JSON.stringify({ title: 'Product1', price: 10, count: 5 }) },
          { body: JSON.stringify({ title: 'Product2', price: 20, count: 8 }) },
        ],
      };
  
      await catalogBatchProcess(event);
  
      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          Subject: 'New Products',
          Message: `New products were added to the database in the amount of ${event.Records.length}`,
        }),
        expect.any(Function)
      );
    });
  });