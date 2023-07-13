import { Command, CommandRunner, Option } from 'nest-commander';
import { FindProductsService } from './findproducts.service';

interface FindProductsCommandOptions {
  name?: string;
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
    } else {
      this.runWithNone();
    }
  }

  @Option({
    flags: '-name, --name [string]',
    description: 'the input product name to search for',
  })
  parseString(val: string): string {
    return val;
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
