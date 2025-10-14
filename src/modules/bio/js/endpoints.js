export const bioEndpoints = {
    bio: {
        species: 'bio/geobotany/species/',
        speciesDetail: (speciesId) => `bio/geobotany/species/${speciesId}/`,
        
        sites: 'bio/geobotany/sites/',
        siteById: (id) => `bio/geobotany/sites/${id}/`,
        siteDetail: (siteNumber, zoneType) => `bio/geobotany/sites/${siteNumber}/${zoneType}/`,
        bulkDeleteSites: 'bio/geobotany/sites/bulk-delete/',
        
        descriptions: (siteNumber, zoneType) => `bio/geobotany/sites/${siteNumber}/${zoneType}/descriptions/`,
        descriptionDetail: (descriptionId) => `bio/geobotany/descriptions/${descriptionId}/`,
        bulkDeleteDescriptions: 'bio/geobotany/descriptions/bulk-delete/',
    
        siteMeans: (siteNumber, zoneType) => `bio/geobotany/sites/${siteNumber}/${zoneType}/means/`,
        customSiteMeans: 'bio/geobotany/sites/custom-means/',
    
        siteDistribution: (siteNumber, zoneType) => `bio/geobotany/sites/${siteNumber}/${zoneType}/distribution/`,
        customSiteDistribution: 'bio/geobotany/sites/custom-distribution/',
    
        siteClassification: (siteNumber, zoneType) => `bio/geobotany/sites/${siteNumber}/${zoneType}/classification/`,
        customSiteClassification: 'bio/geobotany/sites/custom-classification/',
    
        siteComparison: 'bio/geobotany/sites/comparison/',
        customAnalysis: 'bio/geobotany/sites/custom-analysis/',

        // Zoology submodule endpoints
        zoology: {
            species: 'bio/zoology/species/',
            speciesDetail: (id) => `bio/zoology/species/${id}/`,
            populations: 'bio/zoology/populations/',
            populationDetail: (id) => `bio/zoology/populations/${id}/`,
            observations: 'bio/zoology/observations/',
            observationDetail: (id) => `bio/zoology/observations/${id}/`,
        },
        // Interactions submodule endpoints
        interactions: {
            interactions: 'bio/interactions/interactions/',
            interactionDetail: (id) => `bio/interactions/interactions/${id}/`,
        },
        // Successions submodule endpoints
        successions: {
            successions: 'bio/successions/successions/',
            successionDetail: (id) => `bio/successions/successions/${id}/`,
            stages: 'bio/successions/stages/',
            stageDetail: (id) => `bio/successions/stages/${id}/`,
            stageSpecies: 'bio/successions/stage-species/',
            stageSpeciesDetail: (id) => `bio/successions/stage-species/${id}/`,
        },
        // Paleobotany submodule endpoints
        paleobotany: {
            samples: 'bio/paleobotany/samples/',
            sampleDetail: (id) => `bio/paleobotany/samples/${id}/`,
            images: 'bio/paleobotany/images/',
            imageDetail: (id) => `bio/paleobotany/images/${id}/`,
        },
        // Floristics submodule endpoints
        floristics: {
            lists: 'bio/floristics/lists/',
            listDetail: (id) => `bio/floristics/lists/${id}/`,
            items: 'bio/floristics/items/',
            itemDetail: (id) => `bio/floristics/items/${id}/`,
        },
        // Geomorphology submodule endpoints
        geomorphology: {
            profiles: 'bio/geomorphology/profiles/',
            profileDetail: (id) => `bio/geomorphology/profiles/${id}/`,
            layers: 'bio/geomorphology/layers/',
            layerDetail: (id) => `bio/geomorphology/layers/${id}/`,
            images: 'bio/geomorphology/images/',
            imageDetail: (id) => `bio/geomorphology/images/${id}/`,
        },
    }
};