import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @ApiOperation({ summary: 'Get public menu by shop slug' })
  @ApiOkResponse({ description: 'Public menu' })
  @Get('menu/:slug')
  getMenu(@Param('slug') slug: string) {
    return this.publicService.getMenu(slug);
  }

  @Public()
  @ApiOperation({ summary: 'Get public menu categories by shop slug' })
  @ApiOkResponse({ description: 'Public menu categories' })
  @Get('menu/:slug/categories')
  getCategories(@Param('slug') slug: string) {
    return this.publicService.getCategories(slug);
  }

  @Public()
  @ApiOperation({ summary: 'Get a public menu QR code by shop slug' })
  @ApiOkResponse({ description: 'Public menu QR code' })
  @Get('menu/:slug/qrcode')
  getQrCode(@Param('slug') slug: string) {
    return this.publicService.getQrCode(slug);
  }

  @Public()
  @ApiOperation({ summary: 'Get public menu products by shop slug' })
  @ApiOkResponse({ description: 'Public menu products' })
  @Get('menu/:slug/products')
  getProducts(@Param('slug') slug: string) {
    return this.publicService.getProducts(slug);
  }

  @Public()
  @ApiOperation({ summary: 'Get public menu product detail by shop slug' })
  @ApiOkResponse({ description: 'Public menu product detail' })
  @Get('menu/:slug/products/:productId')
  getProduct(
    @Param('slug') slug: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    return this.publicService.getProduct(slug, productId);
  }

  @Public()
  @ApiOperation({ summary: 'Track a public menu QR scan by shop slug' })
  @ApiOkResponse({ description: 'QR scan recorded' })
  @Post('menu/:slug/qr-scan')
  recordQrScan(@Param('slug') slug: string) {
    return this.publicService.recordQrScan(slug);
  }
}
