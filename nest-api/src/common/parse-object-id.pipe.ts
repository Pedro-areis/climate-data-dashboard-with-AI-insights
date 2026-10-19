import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const OBJECT_ID = /^[a-f\d]{24}$/i;

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!OBJECT_ID.test(value)) {
      throw new BadRequestException('Invalid id');
    }
    return value;
  }
}
