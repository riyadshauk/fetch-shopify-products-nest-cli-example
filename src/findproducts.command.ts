import { Command, CommandRunner, Option } from 'nest-commander';
import { FindProductsService } from './findproducts.service';

interface FindProductsCommandOptions {
  name?: string;
  all?: boolean;
}

@Command({
  name: 'findproducts',
  description:
    'A command for finding product variants by provided name substring, sorted by price.',
})
export class FindProductsCommand extends CommandRunner {
  constructor(private readonly findProductsService: FindProductsService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: FindProductsCommandOptions,
  ): Promise<void> {
    if (options?.name !== undefined && options?.name !== null) {
      this.runWithName(passedParam, options.name);
    } else if (options?.all !== undefined && options?.all) {
      this.runWithName(passedParam, '');
    } else {
      this.runWithNone();
    }
  }

  @Option({
    flags: '-name, --name [string]',
    description: 'the input product name substring to search for',
  })
  parseName(val: string): string {
    return val;
  }

  @Option({
    flags: '-all, --all',
    description: 'a boolean flag, if you want to retrieve all products',
  })
  parseAll(): boolean {
    return true;
  }

  runWithName(_param: string[], name: string): void {
    this.findProductsService.getProducts(name);
  }

  runWithNone(): void {
    throw new Error(
      'No product name (search string) was provided as a program argument! Arborting...\n',
    );
  }
}
