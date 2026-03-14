import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Global() // available everywhere without importing
@Module({
  providers: [CloudinaryService],
  exports:   [CloudinaryService],
})
export class CloudinaryModule {}