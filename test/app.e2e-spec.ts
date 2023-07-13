import { TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { CommandTestFactory } from 'nest-commander-testing';
import { FindProductsService } from './../src/findproducts.service';

describe('findproducts Command', () => {
  let commandInstance: TestingModule;
  let findProductsService: FindProductsService;

  beforeAll(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [AppModule],
    }).compile();
    findProductsService = commandInstance.get(FindProductsService);
  });

  it('should call the "findproducts" method with -name provided via CLI argument (actual behavior tested in unit test)', async () => {
    CommandTestFactory.setAnswers(['echo Hello World!']);
    const findProductsServiceSpy = jest.spyOn(
      findProductsService,
      'getProducts',
    );
    await CommandTestFactory.run(commandInstance, [
      'findproducts',
      '-name',
      'dummyProduct',
    ]);
    expect(findProductsServiceSpy).toBeCalledWith('dummyProduct');
  });
});
