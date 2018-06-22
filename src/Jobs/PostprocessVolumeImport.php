<?php

namespace Biigle\Modules\Sync\Jobs;

use Biigle\Volume;
use Biigle\Jobs\Job;
use Biigle\Annotation;
use Illuminate\Support\Collection;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Biigle\Modules\Largo\LargoServiceProvider;
use Biigle\Modules\Largo\Jobs\GenerateAnnotationPatch;

class PostprocessVolumeImport extends Job implements ShouldQueue
{
    use InteractsWithQueue, DispatchesJobs;

    /**
     * IDs of the imported volumes.
     *
     * @var array
     */
    protected $ids;

    /**
     * Create a new job instance.
     *
     * @param Annotation $annotation
     *
     * @return void
     */
    public function __construct(Collection $volumes)
    {
        $this->ids = $volumes->pluck('id')->toArray();
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Volume::whereIn('id', $this->ids)->select('id')->each(function ($volume) {
            $volume->handleNewImages();
        });

        if (class_exists(LargoServiceProvider::class)) {
            Annotation::join('images', 'images.id', '=', 'annotations.image_id')
                ->whereIn('images.volume_id', $this->ids)
                ->select('annotations.id')
                ->chunkById(1000, function ($annotations) {
                    foreach ($annotations as $annotation) {
                        $this->dispatch(new GenerateAnnotationPatch($annotation));
                    }
                }, 'annotations.id', 'id');
        }
    }
}